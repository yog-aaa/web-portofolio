import type { NextRequest } from "next/server";
import { createAdminGate } from "@/lib/auth/admin-gate";
import { requireOwner } from "@/lib/auth/require-owner";

const gate = createAdminGate((headers) => requireOwner("cms:read", headers));

export function proxy(request: NextRequest) {
  return gate(request);
}

export const config = { matcher: ["/admin/:path*"] };
