import "server-only";

import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import { createDatabaseConnection } from "../lib/database/connection";
import { seedDevelopmentContent } from "./development/seed";

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    throw new Error("Development seed is disabled in production and test modes.");
  }
  if (!process.argv.includes("--confirm-development")) {
    throw new Error("Refusing to seed without --confirm-development. Verify the database target first.");
  }
  loadEnvConfig(resolve(__dirname, ".."), true, {
    info: () => {}, error: () => { throw new Error("Environment loading failed."); },
  });
  const { db, client } = createDatabaseConnection(process.env);
  try {
    const result = await seedDevelopmentContent(db);
    console.log(`Development seed complete: profile ${result.profile}, education ${result.education}, project ${result.project}, research ${result.research}, Thought ${result.thought}.`);
    console.log(`Master data: ${result.categoriesCreated} categories and ${result.technologiesCreated} technologies created; existing rows preserved.`);
    console.log("Unverified experience, credential, social, and Thought samples remain hidden or draft until replaced.");
    console.log("The research entry remains a draft until missing publication facts are supplied and reviewed.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch(() => {
  // Driver errors may include SQL parameters or connection details.
  console.error("Development seed failed. Verify the explicit confirmation, environment, database target, TLS, and migrations. No credentials are logged.");
  process.exitCode = 1;
});
