'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StoreInput, storeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth-utils";

/**
 * Fetches all store records.
 *
 * @returns A promise resolving to the current list of stores.
 * @throws An Error with the message "Failed to fetch stores" when the Prisma query fails.
 */
export async function getStores() {
    try {
        const stores = await prisma.store.findMany()
        return stores
    } catch (error) {
        console.error("Error fetching stores:", error)
        throw new Error("Failed to fetch stores", { cause: error })
    }
}

/**
 * Creates a store after administrator authorization and Zod validation.
 *
 * @param storeInput - Store fields: name and optional address.
 * @returns `{ success: true }` when created. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-name Prisma P2002, or general database failures.
 */
export async function addStore(storeInput: StoreInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()

    if (!currentUser || currentUser.profile?.role !== "ADMIN") {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators can perform this action." 
        }
    }

    // Validate the store input before proceeding
    const validated = storeSchema.safeParse(storeInput)
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message 
        }
    }

    const data = validated.data

    try {
        await prisma.store.create({
            data: {
                name: data.name,
                address: data.address
            }
        })

        // Refresh store tables and store selectors with the new record.
        revalidatePath('/store')
        return { success: true }

    } catch (error) {
        console.error("Error adding store:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A store with this name already exists." }
            }           
        }

        return { 
            success: false, 
            error: "Failed to add store. Please try again." 
        }
    }
}

/**
 * Updates a store after administrator authorization and Zod validation.
 *
 * @param id - Unique identifier of the store to update.
 * @param storeInput - Store fields to persist: name and optional address.
 * @returns `{ success: true }` when updated. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-name Prisma P2002, or general database failures.
 */
export async function updateStore(id: string, storeInput: StoreInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()

    if (!currentUser || currentUser.profile?.role !== "ADMIN") {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators can perform this action." 
        }
    }
    
    // Validate the store input before proceeding
    const validated = storeSchema.safeParse(storeInput)
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message 
        }
    }

    const data = validated.data

    try {
        await prisma.store.update({
            where: {
                id: id,
            },
            data: {
                name: data.name,
                address: data.address
            }
        })

        // Refresh store listings and selectors with the updated name or address.
        revalidatePath('/store')
        return { success: true }
        
    } catch (error) {
        console.error("Error updating store:", error) 
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A store with this name already exists." }; 
            }           
        }

        return { 
            success: false, 
            error: "Failed to update store. Please try again."
        }
    }
}

/**
 * Deletes a store after confirming administrator authorization.
 *
 * @param id - Unique identifier of the store to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for authorization
 * or database failures.
 */
export async function deleteStore(id: string) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()

    if (!currentUser || currentUser.profile?.role !== "ADMIN") {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators can perform this action." 
        }
    }

    try {
        await prisma.store.delete({
            where: {
                id: id,
            }
        })
        // Refresh store listings and selectors after removing the record.
        revalidatePath('/store')
        return { success: true }

    } catch (error) {
        console.error("Error deleting store:", error)
        return { 
            success: false, 
            error: "Failed to delete store" 
        }
    }
}