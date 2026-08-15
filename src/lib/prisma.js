import { PrismaClient } from '@prisma/client'

// Reuse a single PrismaClient across hot-reloads / serverless invocations.
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

/** True once the DB connection string is present. */
export function isDbConfigured() {
	return Boolean(process.env.DATABASE_URL)
}
