import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Gunakan koneksi database persisten (Singleton) untuk mencegah pool exhaustion di Supabase
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Selalu simpan di globalThis agar tidak membuat koneksi baru berulang kali
globalForPrisma.prisma = db;
