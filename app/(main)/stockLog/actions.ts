'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StockLogInput, stockLogSchema, StoreStockInput, storeStockSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


/**
 * Fetches stock-log audit records newest-first with their product relations.
 *
 * @returns A promise resolving to stock logs; nested product Decimal prices are converted to JavaScript
 * numbers for use by client components.
 * @throws An Error with the message "Failed to fetch stock logs" when the Prisma query fails.
 */
export async function getStockLogs() {
    try {
        const stockLogs = await prisma.stockLog.findMany({
            include: {
                product: true,
            },
            orderBy: { createdAt: 'desc' }
        })
        
        return stockLogs.map(stockLog => ({
            ...stockLog, 
            product: {
                ...stockLog.product,
                // Map Decimal fields to standard numbers for client component
                costPrice: stockLog.product.costPrice.toNumber(),
                sellingPrice: stockLog.product.sellingPrice.toNumber(),
            },
        }))

    } catch (error) {
        console.error("Error fetching stock logs:", error)
        throw new Error("Failed to fetch stock logs", { cause: error })
    }
}

/**
 * Builds a CSV export for stock logs belonging to one store.
 *
 * @param storeId - Store identifier used to filter StockLog records.
 * @param storeName - Display name written into the generated CSV rows.
 * @returns `{ success: true, csv }`, where `csv` contains a header row and one row per matching stock log.
 * @throws Prisma query or data-processing exceptions are propagated to the caller rather than converted
 * to a result object.
 */
export async function getStockLogsCSV(
    storeId: string, 
    storeName: string, 
) {
    const stockLogs = await prisma.stockLog.findMany({
        where: {
            storeId: storeId
        },
        include: {
            product: true
        }
    })

    const categories = await prisma.category.findMany()

    // map database rows into CSV text format
    const headers = "Product,SKU,Category,Store,Qty,TotalPrice,Reason,Notes,Time,Date\n";
    const rows = stockLogs.map((log) => {
        const category = categories.find((category) => category.id === log.product.categoryId)

        const totalPrice = (Math.abs(log.changeAmount * log.product.sellingPrice.toNumber())).toFixed(2)

        const time = log.createdAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
                        
        const date = new Date(log.createdAt)

        return `"${log.product.name}","${log.product.sku}","${category?.name}","${storeName}","${log.changeAmount}","${totalPrice}","${log.reason}","${log.notes}","${time}","${date}"`
    }).join("\n")

    const csvContent = headers + rows;

    return { success: true, csv: csvContent };
}

/**
 * Atomically adjusts store-stock quantity and creates the corresponding stock-log audit record.
 *
 * @param storeStockInput - Store/product identifiers, requested quantity, and minimum stock threshold.
 * @param stockLogInput - Store/product identifiers, quantity, reason, and optional notes used to derive
 * and record the signed change amount.
 * @returns `{ success: true }` after both writes commit. Returns `{ success: false, error }` for Zod
 * validation, unauthenticated sessions, duplicate Prisma P2002 conflicts, or other transaction failures.
 */
export async function addOrUpdateStoreStocksWithLog(storeStockInput: StoreStockInput, stockLogInput: StockLogInput) {
    // Validate the store stock input before proceeding
    const validatedStoreStock = storeStockSchema.safeParse(storeStockInput);
    if (!validatedStoreStock.success) {
        return { 
            success: false,
            error: validatedStoreStock.error.issues[0].message 
        }
    }

    const validatedStockLog = stockLogSchema.safeParse(stockLogInput);
    if (!validatedStockLog.success) {
        return { 
            success: false,
            error: validatedStockLog.error.issues[0].message 
        }
    }

    const storeStockData = validatedStoreStock.data;
    const stockLogData = validatedStockLog.data;
    
    // Get user ID
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId) {
        return { success: false, error: "Unauthorized. Please log in again." };
    }

    // Determine if quantity should add (+) or subtract (-) based on the reason
    let changeMultiplier = 1;
    if (stockLogData.reason === "SALE" || stockLogData.reason === "DAMAGE") {
        changeMultiplier = -1; // Subtract stock
    } else if (stockLogData.reason === "RESTOCK") {
        changeMultiplier = 1;  // Add stock
    } else if (stockLogData.reason === "ADJUSTMENT") {
        changeMultiplier = 1; 
    }

    const finalChangeAmount = storeStockData.quantity * changeMultiplier;

    try {
        // Keep the stock quantity and its audit record in one atomic database transaction.
        await prisma.$transaction(async (tx) => {
            await tx.storeStock.upsert({
                where: {
                    storeId_productId: {
                        storeId: storeStockData.storeId,
                        productId: storeStockData.productId
                    }
                },
                update: {
                    quantity: {
                        increment: finalChangeAmount 
                    }
                },
                create: {
                    storeId: storeStockData.storeId,
                    productId: storeStockData.productId,
                    // Prevent initial stock from dropping below 0 if creating via a sale/damage entry
                    quantity: Math.max(0, finalChangeAmount), 
                    minStockThreshold: storeStockData.minStockThreshold
                }
            });

            // 2. Create the audit log record with the signed change amount
            await tx.stockLog.create({
                data: {
                    productId: stockLogData.productId,
                    storeId: stockLogData.storeId,
                    userId: userId,
                    changeAmount: finalChangeAmount, 
                    reason: stockLogData.reason,
                    notes: stockLogData.notes
                }
            });
        });

        // Refresh stock listings and audit-dependent inventory views after both writes commit.
        revalidatePath('/stock');
        return { success: true };

    } catch (error) {
        console.error("Error updating stock:", error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A stock entry for this product at this store already exists." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to update stock. Please try again." 
        }
    }
}

/**
 * Deletes a store-stock inventory row by identifier.
 *
 * @param id - Unique identifier of the StoreStock record to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for database failures.
 */
export async function deleteStock(id: string) {
    try {
        await prisma.storeStock.delete({
            where: {
                id: id,
            }
        })
        // Refresh stock listings and inventory totals after the row is removed.
        revalidatePath('/stock')
        return { success: true }

    } catch (error) {
        console.error("Error deleting store stock:", error)
        return { 
            success: false, 
            error: "Failed to delete store stock" 
        }
    }
}