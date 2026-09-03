import "server-only";

import { loadEnvConfig } from "@next/env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "node:path";

import { createDatabaseConnection } from "../lib/database/connection";

async function main() {
  if (process.env.NODE_ENV === "test") {
    throw new Error("Database migration cannot run in test mode.");
  }

  const projectRoot = resolve(__dirname, "..");
  loadEnvConfig(projectRoot, process.env.NODE_ENV !== "production", {
    info: () => {},
    error: () => {
      throw new Error("Environment loading failed.");
    },
  });

  const { db, client } = createDatabaseConnection(process.env);

  try {
    await migrate(db, { migrationsFolder: resolve(projectRoot, "drizzle") });
    console.log("Database migrations applied successfully.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  // Driver errors may contain connection details or SQL parameters.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42501"
  ) {
    console.error(
      "Database migration failed because the configured database user lacks schema creation privileges. Use an approved migration account or grant the required PostgreSQL privileges. No credentials are logged.",
    );
    process.exitCode = 1;
    return;
  }

  console.error(
    "Database migration failed. Verify the environment, target database, TLS certificate, privileges, and migration files. No credentials are logged.",
  );
  process.exitCode = 1;
});
