import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getConnectionString(): string {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured in environment variables. Please add DATABASE_URL (or DIRECT_URL) to your environment."
    );
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: getConnectionString() }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
