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
              // Check if the registered email matches the designated bootstrap admin
              const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
              const assignedRole = (bootstrapEmail && user.email.toLowerCase() === bootstrapEmail.toLowerCase()) 
                  ? 'ADMIN' 
                  : 'STAFF';

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