import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

import { parseDatabaseEnvironment } from "./lib/validation/environment";

// Drizzle Kit loads this file through its CommonJS config loader. Resolve paths
// from the config itself so --config also works outside the repository directory.
const projectRoot = __dirname;

if (process.env.NODE_ENV === "test") {
  throw new Error("Run Drizzle Kit in development or production mode; test mode skips .env.local.");
}

loadEnvConfig(projectRoot, process.env.NODE_ENV !== "production", {
  info: () => {},
  error: () => {
    throw new Error("Unable to load local environment files for Drizzle Kit.");
  },
});

const { DATABASE_URL } = parseDatabaseEnvironment({
  DATABASE_URL: process.env.DATABASE_URL,
});

export default defineConfig({
  dialect: "postgresql",
  schema: resolve(projectRoot, "lib/database/schema/**/*.ts").replaceAll("\\", "/"),
  out: resolve(projectRoot, "drizzle"),
  dbCredentials: { url: DATABASE_URL },
  strict: true,
  verbose: false,
});
