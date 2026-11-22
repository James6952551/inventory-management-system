'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ProductInput, productSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth-utils";

/**
 * Fetches products newest-first and includes their category and supplier relations.
 *
 * @returns A promise resolving to product records with Decimal cost and selling prices converted
 * to JavaScript numbers for use by client components.
 * @throws An Error with the message "Failed to fetch products" when the Prisma query fails.
 */
export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                supplier: true
            },
            orderBy: { createdAt: 'desc' }
        })
        
        // Map Decimal fields to standard numbers for client components
        return products.map(product => ({
            ...product,
            costPrice: product.costPrice.toNumber(),
            sellingPrice: product.sellingPrice.toNumber(),
        }))

    } catch (error) {
        console.error("Error fetching products:", error)
        throw new Error("Failed to fetch products", { cause: error })
    }
}

/**
 * Creates a product after administrator or manager authorization and Zod validation.
 *
 * @param productInput - Product fields: name, SKU, costPrice, sellingPrice, categoryId, and
 * supplierId. Numeric fields may be strings because the validation schema coerces numbers.
 * @returns `{ success: true }` when created. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-SKU Prisma P2002, or general database failures.
 */
export async function addProduct(productInput: ProductInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        }
    }
    
    // Validate the product input before proceeding
    const validated = productSchema.safeParse(productInput);
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message // Return the first validation error message
        }
    }

    const data = validated.data

    try {
        await prisma.product.create({
            data: {
                name: data.name,
                sku: data.sku,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                categoryId: data.categoryId,
                supplierId: data.supplierId
            }
        })

        // Refresh product listings and any product selectors backed by this route's data.
        revalidatePath('/product')
        return { success: true }

    } catch (error) {
        console.error("Error adding product:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A product with this SKU already exists." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to add product. Please try again." 
        }
    }
}

/**
 * Updates a product after administrator or manager authorization and Zod validation.
 *
 * @param id - Unique identifier of the product to update.
 * @param productInput - Complete product fields for name, SKU, prices, category, and supplier.
 * @returns `{ success: true }` when updated. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-SKU Prisma P2002, or general database failures.
 */
export async function updateProduct(id: string, productInput: ProductInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        }
    }
    
    // Validate the product input before proceeding
    const validated = productSchema.safeParse(productInput);
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message // Return the first validation error message
        }
    }

    const data = validated.data

    try {
        await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                name: data.name,
                sku: data.sku,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                categoryId: data.categoryId,
                supplierId: data.supplierId
            }
        })

        // Refresh product tables and dependent product selectors after the update.
        revalidatePath('/product')
        return { success: true }
        
    } catch (error) {
        console.error("Error updating product:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A product with this SKU already exists." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to update product. Please try again." 
        }
    }
}

/**
 * Deletes a product after confirming administrator or manager authorization.
 *
 * @param id - Unique identifier of the product to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for authorization
 * or database failures.
 */
export async function deleteProduct(id: string) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        }
    }
    
    try {
        await prisma.product.delete({
            where: {
                id: id,
            }
        })
        // Refresh product listings and selectors so deleted products are no longer offered.
        revalidatePath('/product')
        return { success: true }

    } catch (error) {
        console.error("Error deleting product:", error)
        return { 
            success: false, 
            error: "Failed to delete product" 
        }
    }
}