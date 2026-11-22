'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StockLogInput, stockLogSchema, StoreStockInput, storeStockSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


/**
 * Fetches store-stock inventory rows newest-first with their store and product relations.
 *
 * @returns A promise resolving to inventory records; nested product Decimal prices are converted
 * to JavaScript numbers for use by client components.
 * @throws An Error with the message "Failed to fetch store stocks" when the Prisma query fails.
 */
export async function getStoreStocks() {
    try {
        const storeStocks = await prisma.storeStock.findMany({
            include: {
                store: true,
                product: true
            },
            orderBy: { createdAt: 'desc' }
        })
        
        return storeStocks.map(stock => ({
            ...stock, 
            product: {
                ...stock.product,
                // Map Decimal fields to standard numbers for client component
                costPrice: stock.product.costPrice.toNumber(),
                sellingPrice: stock.product.sellingPrice.toNumber(),
            },
        }))

    } catch (error) {
        console.error("Error fetching store stocks:", error)
        throw new Error("Failed to fetch store stocks", { cause: error })
    }
}

/**
 * Atomically adjusts an existing or new store-stock quantity and creates the corresponding stock log.
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
        // These writes must commit together so inventory cannot change without a matching audit log.
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

        // Refresh stock views and inventory-dependent UI after the atomic quantity and log updates.
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