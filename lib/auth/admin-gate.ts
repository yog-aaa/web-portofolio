import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { AuthorizationError, type OwnerIdentity } from "./authorization";
import { privateResponse } from "./http";

// Dependency injection keeps the real route gate testable without a live database.
export function createAdminGate(authorize: (headers: Headers) => Promise<OwnerIdentity>) {
  return async (request: NextRequest) => {
    if (request.nextUrl.pathname.replace(/\/$/, "") === "/admin/login") {
      return privateResponse(NextResponse.next());
    }
    try {
      await authorize(request.headers);
      return privateResponse(NextResponse.next());
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        return privateResponse(NextResponse.redirect(new URL("/admin/login", request.url), 303));
      }
      const status = error instanceof AuthorizationError ? 403 : 503;
      return privateResponse(new NextResponse(status === 403 ? "Owner access required." :
        "Owner access is temporarily unavailable.", { status }));
    }
  };
}
