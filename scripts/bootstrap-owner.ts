import "server-only";

import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import { createDatabaseConnection } from "../lib/database/connection";
import { parseAuthEnvironment, parseBootstrapEnvironment } from "../lib/validation/environment";
import { BootstrapConflict, provisionOwner } from "./auth/bootstrap";

async function main() {
  if (process.env.NODE_ENV === "test") throw new Error("Bootstrap cannot run in test mode.");
  loadEnvConfig(resolve(__dirname, ".."), process.env.NODE_ENV !== "production", {
    info: () => {}, error: () => { throw new Error("Environment loading failed."); },
  });
  const environment = parseAuthEnvironment(process.env);
  const input = parseBootstrapEnvironment(process.env);
  const { db, client } = createDatabaseConnection(process.env.DATABASE_URL);
  try {
    const result = await provisionOwner(db, environment, input);
    console.log(result === "created" ? "Owner provisioned successfully." : "Owner already provisioned. Nothing changed.");
    console.log("Remove BOOTSTRAP_OWNER_PASSWORD from Vercel and local environment settings. Change the temporary password after signing in.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  // Never print driver/adapter exceptions: they can contain SQL parameters or credentials.
  console.error(error instanceof BootstrapConflict ? error.message :
    "Owner provisioning failed. Check the environment, database TLS, and applied migrations. No credentials are logged.");
  process.exitCode = 1;
});
