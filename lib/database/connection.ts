import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { parseDatabaseEnvironment } from "../validation/environment";
import * as schema from "./schema";

// Shared by the Next.js singleton and explicit CLI operations. No query on creation.
export function createDatabaseConnection(databaseUrl: string | undefined) {
  const { DATABASE_URL } = parseDatabaseEnvironment({ DATABASE_URL: databaseUrl });
  const client = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: true },
    prepare: false,
    debug: false,
    onnotice: () => {},
  });
  return { client, db: drizzle({ client, schema, logger: false }) };
}

// The auth adapter also accepts transaction-scoped and isolated PostgreSQL clients.
export type AuthDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;
