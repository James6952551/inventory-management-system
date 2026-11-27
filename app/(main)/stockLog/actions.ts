'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StockLogInput, stockLogSchema, StoreStockInput, storeStockSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requireAuthenticatedUser } from "@/lib/auth-utils";


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
export async function getStockLogsCSV(storeId: string, storeName: string) {
    try {
        // validate if user is authenticated
        await requireAuthenticatedUser()

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
        const csvHeaders = "Product,SKU,Category,Store,Qty,TotalPrice,Reason,Notes,Time,Date\n"
        const rows = stockLogs.map((log) => {
            const category = categories.find((c) => c.id === log.product.categoryId)
            const totalPrice = (Math.abs(log.changeAmount * log.product.sellingPrice.toNumber())).toFixed(2)
            const time = log.createdAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
            const date = new Date(log.createdAt).toLocaleDateString();

            return `"${log.product.name}","${log.product.sku}","${category?.name || 'Uncategorized'}","${storeName}","${log.changeAmount}","${totalPrice}","${log.reason}","${log.notes || ''}","${time}","${date}"`
        }).join("\n")

        const csvContent = csvHeaders + rows

        return { success: true, csv: csvContent }

    } catch (error) {
        console.error("Error generating stock logs CSV:", error)
        return { 
            success: false, 
            error: "Failed to generate stock logs CSV report. Please try again." 
        }
    }
}