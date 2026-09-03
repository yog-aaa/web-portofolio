import "server-only";

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AuthDatabase } from "../database/connection";
import { user, session, account, verification, rateLimit } from "../database/schema/auth";
import { findOwnerUserId } from "../repositories/owner";
import { baseAuthOptions, type AuthEnvironment } from "./options";

export function createAuth(db: AuthDatabase, environment: AuthEnvironment) {
  return betterAuth({
    ...baseAuthOptions(environment),
    database: drizzleAdapter(db, {
      provider: "pg", schema: { user, session, account, verification, rateLimit }, transaction: true,
    }),
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/change-password": { window: 60, max: 5 },
      },
    },
    databaseHooks: {
      session: { create: { before: async (value) => {
        if (await findOwnerUserId(db) !== value.userId) {
          throw new APIError("UNAUTHORIZED", { message: "Invalid email or password." });
        }
        return { data: value };
      } } },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
