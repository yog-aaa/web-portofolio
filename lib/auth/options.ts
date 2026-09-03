import "server-only";

import type { BetterAuthOptions } from "better-auth";
import type { parseAuthEnvironment } from "../validation/environment";

export type AuthEnvironment = ReturnType<typeof parseAuthEnvironment>;

export function baseAuthOptions(environment: AuthEnvironment) {
  return {
    appName: "YOGAAA.",
    baseURL: environment.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: environment.BETTER_AUTH_SECRET,
    trustedOrigins: [environment.BETTER_AUTH_URL],
    logger: { disabled: true },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 12,
      disableSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    account: { accountLinking: { enabled: false } },
    advanced: {
      cookiePrefix: "yogaaa",
      useSecureCookies: environment.BETTER_AUTH_URL.startsWith("https:"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" as const, path: "/" },
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
    },
  } satisfies BetterAuthOptions;
}
