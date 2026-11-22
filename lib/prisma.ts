import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

// Prevent multiple instances of Prisma Client & Pool in development (Next.js hot-reloading)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Reuse existing pool/client if available, otherwise create new ones
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}