import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
const globalForPrisma = global;
const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
});
export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter
});
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map