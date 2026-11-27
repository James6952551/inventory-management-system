'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ProfileInput, profileSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";

/**
 * Fetches all users and includes their profile relations.
 *
 * @returns A promise resolving to user records with profile data.
 * @throws An Error with the message "Failed to fetch users" when the Prisma query fails.
 */
export async function getUsers() {   
    try {
        // validate the current user role before proceeding
        await requireRole(["ADMIN"])

        const users = await prisma.user.findMany({
            include: {
                profile: true
            }
        })
        return users
    } catch (error) {
        console.error("Error fetching users:", error)
        throw new Error("Failed to fetch users", { cause: error })
    }
}

/**
 * Updates a user's role and department after administrator authorization and Zod validation.
 *
 * @param id - Unique user identifier used to locate the related profile by `userId`.
 * @param profileInput - Profile fields: name, role (ADMIN, MANAGER, or STAFF), and optional department.
 * @returns `{ success: true }` when updated. Returns `{ success: false, error }` for authorization,
 * validation, Prisma P2002 conflicts, or general database failures.
 */
export async function updateProfile(id: string, profileInput: ProfileInput) {
    // Validate the store input before proceeding
    const validated = profileSchema.safeParse(profileInput);
    if (!validated.success) {
        return { 
            success: false,
            error: validated.error.issues[0].message // Return the first validation error message
        }
    }

    const validatedProfileInput = validated.data

    try {
        // validate the current user role before proceeding
        await requireRole(["ADMIN"])

        await prisma.profile.update({
            where: {
                userId: id,
            },
            data: {
                role: validatedProfileInput.role,
                department: validatedProfileInput.department
            }
        })

        // Refresh the user management route so role and department changes appear immediately.
        revalidatePath('/user')
        return { success: true }
        
    } catch (error) {
        console.error("Error updating user:", error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: "A conflict occurred while updating the profile." };
            }           
        }

        return { 
            success: false, 
            error: "Failed to update profile. Please try again." 
        }
    }
}

/**
 * Deletes a user after confirming administrator authorization.
 *
 * @param id - Unique identifier of the user to delete.
 * @returns `{ success: true }` when deleted. Returns `{ success: false, error }` for authorization
 * or database failures.
 */
export async function deleteUser(id: string) {
    try {
        // validate the current user role before proceeding
        await requireRole(["ADMIN"])

        await prisma.user.delete({
            where: {
                id: id,
            }
        })
        // Refresh the user management route so deleted accounts disappear from the table.
        revalidatePath('/user')
        return { success: true }

    } catch (error) {
        console.error("Error deleting user:", error)
        return { 
            success: false, 
            error: "Failed to delete user" 
        }
    }
}