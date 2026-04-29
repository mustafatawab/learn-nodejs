import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env"

const globalForPrisma = global as unknown as { prisma : PrismaClient}

const adapter = new PrismaPg({
    connectionString : env.DATABASE_URL,
    max : 20,
    idleTimeoutMillis : 30000,
    connectionTimeoutMillis : 5000,
})

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter
})

if (process.env.NODE_ENV !== "production")  globalForPrisma.prisma = prisma

