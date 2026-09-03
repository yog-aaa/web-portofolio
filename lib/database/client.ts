import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { parseDatabaseEnvironment } from "@/lib/validation/environment";

function createDatabase() {
  const { DATABASE_URL } = parseDatabaseEnvironment({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  const client = postgres(DATABASE_URL, {
    // Conservative per-process bound until the Aiven/Vercel budget is measured.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: true },
    prepare: false,
    debug: false,
    onnotice: () => {},
  });

  return drizzle({ client, logger: false });
}

type Database = ReturnType<typeof createDatabase>;

const databaseGlobal = globalThis as typeof globalThis & {
  yogaaaDatabase?: Database;
};

/** Server/repository use only. Initialization is lazy and does not run a query. */
export function getDatabase(): Database {
  databaseGlobal.yogaaaDatabase ??= createDatabase();
  return databaseGlobal.yogaaaDatabase;
}
