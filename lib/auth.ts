import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
      emailAndPassword: { 
      enabled: true, 
    },
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              const totalUsers = await prisma.user.count()
              const assignedRole = totalUsers === 1 ? 'ADMIN' : 'STAFF'
              await prisma.profile.create({
                data: {
                  userId: user.id,
                  role: assignedRole,
                }
              })
            }
          }
        }
      }
});