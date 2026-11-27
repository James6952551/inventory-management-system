'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StockLogInput, stockLogSchema, StoreStockInput, storeStockSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile, requireAuthenticatedUser } from "@/lib/auth-utils";


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
    // Validate inputs
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

    const storeStockData = validatedStoreStock.data
    const stockLogData = validatedStockLog.data

    // CROSS-CHECK: Ensure IDs match between inventory and audit log payloads
    if (storeStockData.storeId !== stockLogData.storeId) {
        return { success: false, error: "Store ID mismatch between stock update and audit log." };
    }
    if (storeStockData.productId !== stockLogData.productId) {
        return { success: false, error: "Product ID mismatch between stock update and audit log." };
    }

    // Determine if quantity should add (+) or subtract (-) based on the reason
    let changeMultiplier = 1
    if (stockLogData.reason === "SALE" || stockLogData.reason === "DAMAGE") {
        changeMultiplier = -1 // Subtract stock
    } else if (stockLogData.reason === "RESTOCK" || stockLogData.reason === "ADJUSTMENT") {
        changeMultiplier = 1 // Add stock
    }

    const finalChangeAmount = storeStockData.quantity * changeMultiplier

    try {
        // validate if user is authenticated
        await requireAuthenticatedUser()

        // get currrent user
        const user = await getCurrentUserWithProfile()
        if (!user?.id) { 
            return { success: false, error: "Unauthorized. Please log in again." } 
        }

        await prisma.$transaction(async (tx) => {
            if (finalChangeAmount < 0) {
                // DECREMENT OPERATION: Atomically update ONLY if quantity is sufficient
                const absChange = Math.abs(finalChangeAmount)

                const updateResult = await tx.storeStock.updateMany({
                    where: {
                        storeId: storeStockData.storeId,
                        productId: storeStockData.productId,
                        quantity: {
                            gte: absChange // blocks execution if stock < requested amount
                        }
                    },
                    data: {
                        quantity: {
                            increment: finalChangeAmount // negative value
                        }
                    }
                })

                // If 0 rows were updated, determine why to throw the exact error
                if (updateResult.count === 0) {
                    const existingRecord = await tx.storeStock.findUnique({
                        where: {
                            storeId_productId: {
                                storeId: storeStockData.storeId,
                                productId: storeStockData.productId
                            }
                        }
                    })

                    if (!existingRecord) {
                        throw new Error("PRODUCT_NOT_FOUND")
                    } else {
                        throw new Error("INSUFFICIENT_STOCK")
                    }
                }
            } else {
                // INCREMENT / RESTOCK OPERATION: Safe to upsert
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
                        quantity: finalChangeAmount,
                        minStockThreshold: storeStockData.minStockThreshold ?? 5
                    }
                })
            }

            // Create the audit log record with the signed change amount
            await tx.stockLog.create({
                data: {
                    productId: stockLogData.productId,
                    storeId: stockLogData.storeId,
                    userId: user.id,
                    changeAmount: finalChangeAmount, 
                    reason: stockLogData.reason,
                    notes: stockLogData.notes
                }
            })
        })

        revalidatePath('/stock')
        return { success: true }

    } catch (error: any) {
        console.error("Error updating stock:", error)
        
        if (error.message === "INSUFFICIENT_STOCK") {
            return { success: false, error: "Insufficient stock available for this operation." }
        }
        if (error.message === "PRODUCT_NOT_FOUND") {
            return { success: false, error: "Stock record not found for this product at the specified store." }
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A stock entry for this product at this store already exists." }
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
export async function deleteStock(storeStockId: string) {
    try {
        // validate if user is authenticated
        await requireAuthenticatedUser()

        // get currrent user
        const user = await getCurrentUserWithProfile()
        if (!user?.id) { 
            return { success: false, error: "Unauthorized. Please log in again." } 
        }

        await prisma.$transaction(async (tx) => {
            // Find the stock record first to get its current quantity and details
            const stockRecord = await tx.storeStock.findUnique({
                where: { id: storeStockId },
            })

            if (!stockRecord) {
                throw new Error("STOCK_NOT_FOUND")
            }

            const currentQuantity = stockRecord.quantity

            // If there is stock remaining, create a compensating audit log for the removal
            if (currentQuantity > 0) {
                await tx.stockLog.create({
                    data: {
                        productId: stockRecord.productId,
                        storeId: stockRecord.storeId,
                        userId: user.id,
                        changeAmount: -currentQuantity, // Negative amount to zero out the stock
                        reason: "ADJUSTMENT",
                        notes: "Inventory stock record removed/deleted by admin.",
                    }
                })
            }

            // Now safely delete the stock record row
            await tx.storeStock.delete({
                where: {
                    id: storeStockId,
                }
            })
        })

        revalidatePath('/stock')
        return { success: true }

    } catch (error: any) {
        console.error("Error deleting store stock:", error)

        if (error.message === "STOCK_NOT_FOUND") {
            return { success: false, error: "Stock record not found." }
        }

        return { 
            success: false, 
            error: "Failed to delete store stock. Please try again."
        }
    }
}
