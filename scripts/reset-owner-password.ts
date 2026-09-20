import "server-only";

import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import { createDatabaseConnection } from "../lib/database/connection";
import { parseOwnerPasswordResetEnvironment } from "../lib/validation/environment";
import { OwnerPasswordResetConflict, resetOwnerPassword } from "./auth/reset-owner-password";

const confirmation = "--confirm-owner-password-reset";

async function main() {
  if (process.env.NODE_ENV === "test") throw new Error("Owner password reset cannot run in test mode.");
  if (process.argv.slice(2).length !== 1 || process.argv[2] !== confirmation) {
    throw new Error(`Owner password reset requires ${confirmation}.`);
  }
  loadEnvConfig(resolve(__dirname, ".."), process.env.NODE_ENV !== "production", {
    info: () => {}, error: () => { throw new Error("Environment loading failed."); },
  });
  const input = parseOwnerPasswordResetEnvironment(process.env);
  const { db, client } = createDatabaseConnection(process.env);
  try {
    await resetOwnerPassword(db, input);
    console.log("Owner password reset successfully. All existing owner sessions were revoked.");
    console.log("Remove RESET_OWNER_EMAIL and RESET_OWNER_PASSWORD from environment settings before signing in again.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof OwnerPasswordResetConflict ||
    (error instanceof Error && error.message.includes(confirmation)) ? error.message :
    "Owner password reset failed. Check the environment, database TLS, and applied migrations. No credentials are logged.");
  process.exitCode = 1;
});
