import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { parseDatabaseEnvironment } from "../validation/environment";
import * as schema from "./schema";

// Shared by the Next.js singleton and explicit CLI operations. No query on creation.
export function createDatabaseConnection(environment: NodeJS.ProcessEnv) {
  const { DATABASE_URL, DATABASE_CA_CERT } = parseDatabaseEnvironment(environment);
  const client = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { ca: DATABASE_CA_CERT, rejectUnauthorized: true },
    prepare: false,
    debug: false,
    onnotice: () => {},
  });
  return { client, db: drizzle({ client, schema, logger: false }) };
}

// The auth adapter also accepts transaction-scoped and isolated PostgreSQL clients.
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export type AuthDatabase = Database;
