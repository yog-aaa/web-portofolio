import "server-only";

import type { AuthDatabase } from "../database/connection";
import { findOwnerUserId } from "../repositories/owner";
import type { Auth } from "./create-auth";

const permissions = { owner: ["cms:read", "cms:write", "account:manage"] } as const;
export type OwnerPermission = (typeof permissions.owner)[number];
export type OwnerIdentity = { id: string; name: string; email: string; role: "owner" };

export class AuthorizationError extends Error {
  constructor(readonly status: 401 | 403) {
    super(status === 401 ? "Sign in required." : "Owner access required.");
  }
}

/** Call at every private read/mutation boundary; never trust a client role. */
export async function authorizeOwner(
  auth: Auth, db: AuthDatabase, headers: Headers, permission: OwnerPermission = "cms:read",
): Promise<OwnerIdentity> {
  const result = await auth.api.getSession({
    headers, query: { disableCookieCache: true, disableRefresh: true },
  });
  if (!result) throw new AuthorizationError(401);
  if (await findOwnerUserId(db) !== result.user.id || !permissions.owner.includes(permission)) {
    throw new AuthorizationError(403);
  }
  return { id: result.user.id, name: result.user.name, email: result.user.email, role: "owner" };
}
