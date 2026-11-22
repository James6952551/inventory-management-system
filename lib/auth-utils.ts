'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getCurrentUserWithProfile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    // Fetch the user and their associated profile from Prisma using the session user ID
    const userWithProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
    });

    return userWithProfile;
}

export async function getUserRoleById(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            profile: true
        }
    })

    const role = user?.profile?.role

    return role
}