import "server-only";

import { createDatabaseConnection } from "./connection";

function createDatabase() {
  return createDatabaseConnection(process.env.DATABASE_URL).db;
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
