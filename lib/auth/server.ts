import "server-only";

import { getDatabase } from "../database/client";
import { parseAuthEnvironment } from "../validation/environment";
import { createAuth, type Auth } from "./create-auth";

let auth: Auth | undefined;

// No credentials or database connection required during next build.
export function getAuth(): Auth {
  auth ??= createAuth(getDatabase(), parseAuthEnvironment({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  }));
  return auth;
}
