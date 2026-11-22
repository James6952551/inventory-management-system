'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { categorySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth-utils";

/**
 * Fetches all categories and their related products.
 *
 * @returns A promise resolving to categories with related product records; Decimal price fields are
 * converted to JavaScript numbers for use by client components.
 * @throws An Error with the message "Failed to fetch categories" when the Prisma query fails.
 */
export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: true
            }
        })

        // Map Decimal fields to standard numbers for client components
        return categories.map(category => ({
            ...category,
            products: category.products.map(product => ({
                ...product,
                costPrice: product.costPrice.toNumber(),
                sellingPrice: product.sellingPrice.toNumber(),
            }))
        }))

    } catch (error) {
        console.error("Error fetching categories:", error)
        throw new Error("Failed to fetch categories", { cause: error })
    }
}

/**
 * Creates a category after authorization and Zod validation.
 *
 * @param name - Category name to validate and insert. It must contain 1 to 50 characters.
 * @returns `{ success: true }` when created. Returns `{ success: false, error }` for missing or
 * unauthorized current-user context, validation failures, duplicate-name Prisma P2002 errors, or
 * any other database failure.
 */
export async function addCategory(name: string) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role;

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        };
    }

    // Validate the category name before proceeding
    const validated = categorySchema.safeParse({ name });
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message // Return the first validation error message
        }
    }

    try {
        await prisma.category.create({
            data: {
                name: name,
            }
        })

        // Refresh the category route so category tables and product-category selections see the new record.
        revalidatePath('/category')
        return { success: true }

    } catch (error) {
        console.error("Error adding category:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A category with this name already exists." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to add category. Please try again." 
        }
    }
}

/**
 * Updates a category name after authorization and Zod validation.
 *
 * @param id - Unique identifier of the category to update.
 * @param name - Replacement name to validate and persist. It must contain 1 to 50 characters.
 * @returns `{ success: true }` when updated. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-name Prisma P2002, or general database failures.
 */
export async function updateCategory(id: string, name: string) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role;

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        };
    }
    
    // Validate the category name before proceeding
    const validated = categorySchema.safeParse({ name });
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message // Return the first validation error message
        }
    }
    try {
        await prisma.category.update({
            where: {
                id: id,
            },
            data: {
                name: name,
            }
        })

        // Refresh category data and any product views that depend on category names.
        revalidatePath('/category')
        return { success: true }
        
    } catch (error) {
        console.error("Error updating category:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A category with this name already exists." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to update category. Please try again." 
        }
    }
}

/**
 * Deletes a category after confirming administrator or manager authorization.
 *
 * @param id - Unique identifier of the category to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for authorization
 * or database failures.
 */
export async function deleteCategory(id: string) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role;

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        };
    }

    try {
        await prisma.category.delete({
            where: {
                id: id,
            }
        })
        // Refresh the category route so removed categories disappear from tables and selectors.
        revalidatePath('/category')
        return { success: true }

    } catch (error) {
        console.error("Error deleting category:", error)
        return { 
            success: false, 
            error: "Failed to delete category" 
        }
    }
}