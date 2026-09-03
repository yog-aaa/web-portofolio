import "server-only";

import type { AuthDatabase } from "../database/connection";
import { AuthorizationError, authorizeOwner } from "./authorization";
import type { Auth } from "./create-auth";

const publicPaths = new Map([
  ["/sign-in/email", "POST"], ["/sign-up/email", "POST"], ["/get-session", "GET"],
]);
const ownerPaths = new Set(["/sign-out", "/change-password"]);

export function privateResponse(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export function authUnavailable() {
  return privateResponse(Response.json({ message: "Authentication is temporarily unavailable." }, { status: 503 }));
}

export function createAuthHttpHandler(auth: Auth, db: AuthDatabase) {
  return async (request: Request): Promise<Response> => {
    const pathname = new URL(request.url).pathname;
    const path = pathname.startsWith("/api/auth/") ? pathname.slice("/api/auth".length) : "";
    if (publicPaths.get(path) !== request.method && !(ownerPaths.has(path) && request.method === "POST")) {
      return privateResponse(Response.json({ message: "Not found." }, { status: 404 }));
    }
    try {
      if (ownerPaths.has(path)) await authorizeOwner(auth, db, request.headers, "account:manage");
      // Use the HTTP handler so Better Auth's CSRF checks and rate limits run.
      // sign-up/email reaches disableSignUp, which is always true in this instance.
      const response = await auth.handler(request);
      if (response.status >= 500) return authUnavailable();
      return privateResponse(response);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return privateResponse(Response.json({ message: error.message }, { status: error.status }));
      }
      return authUnavailable();
    }
  };
}
