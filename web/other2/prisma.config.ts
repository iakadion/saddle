/**
 * prisma.config.ts - prisma 7+ configuration
 *
 * required for prisma 7+ (datasource url must come from config, not schema)
 * the datasource url is provided here and by the adapter in db.ts
 */
import type { PrismaConfig } from "prisma";

export default {
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./db/custom.db",
  },
} satisfies PrismaConfig;
