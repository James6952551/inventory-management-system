'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { SupplierInput, supplierSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth-utils";

/**
 * Fetches all supplier records.
 *
 * @returns A promise resolving to the current supplier list.
 * @throws An Error with the message "Failed to fetch suppliers" when the Prisma query fails.
 */
export async function getSuppliers() {
    try {
        const suppliers = await prisma.supplier.findMany()
        return suppliers
    } catch (error) {
        console.error("Error fetching suppliers:", error)
        throw new Error("Failed to fetch suppliers", { cause: error })
    }
}

/**
 * Creates a supplier after administrator or manager authorization and Zod validation.
 *
 * @param supplierInput - Supplier fields: name, contactEmail, optional phone, and optional address.
 * @returns `{ success: true }` when created. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-name Prisma P2002, or general database failures.
 */
export async function addSupplier(supplierInput: SupplierInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        }
    }
    
    // Validate the supplier details before proceeding
    const validated = supplierSchema.safeParse(supplierInput)
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message 
        }
    }

    const data = validated.data

    try {
        await prisma.supplier.create({
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                phone: data.phone,
                address: data.address
            }
        })

        // Refresh supplier tables and supplier selections with the new record.
        revalidatePath('/supplier')
        return { success: true }

    } catch (error) {
        console.error("Error adding supplier:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A supplier with this name already exists." }
            }           
        }

        return { 
            success: false, 
            error: "Failed to add supplier. Please try again." 
        }
    }
}

/**
 * Updates a supplier after administrator or manager authorization and Zod validation.
 *
 * @param id - Unique identifier of the supplier to update.
 * @param supplierInput - Supplier fields to persist: name, email, optional phone, and optional address.
 * @returns `{ success: true }` when updated. Returns `{ success: false, error }` for authorization,
 * validation, duplicate-name Prisma P2002, or general database failures.
 */
export async function updateSupplier(id: string, supplierInput: SupplierInput) {
    // Validate the current user role before proceeding
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN", "MANAGER"].includes(role)) {
        return { 
            success: false, 
            error: "Unauthorized: Only administrators and managers can perform this action." 
        }
    }
    
    // Validate the supplier details before proceeding
    const validated = supplierSchema.safeParse(supplierInput)

    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message 
        }
    }

    const data = validated.data

    try {
        await prisma.supplier.update({
            where: {
                id: id,
            },
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                phone: data.phone,
                address: data.address
            }
        })

        // Refresh supplier listings and dependent selections after the update.
        revalidatePath('/supplier')
        return { success: true }
        
    } catch (error) {
        console.error("Error updating supplier:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A supplier with this name already exists." }
            }           
        }

        return { 
            success: false, 
            error: "Failed to update supplier. Please try again." 
        }
    }
}

/**
 * Deletes a supplier after confirming administrator or manager authorization.
 *
 * @param id - Unique identifier of the supplier to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for authorization
 * or database failures.
 */
export async function deleteSupplier(id: string) {
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
        await prisma.supplier.delete({
            where: {
                id: id,
            }
        })
        // Refresh supplier listings and selectors after removal.
        revalidatePath('/supplier')
        return { success: true }

    } catch (error) {
        console.error("Error deleting supplier:", error)
        return { 
            success: false, 
            error: "Failed to delete supplier" 
        }
    }
}