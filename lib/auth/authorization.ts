import "server-only";

export type OwnerPermission = "cms:read" | "cms:write" | "account:manage";
export type OwnerIdentity = { id: string; name: string; email: string; role: "owner" };

export class AuthorizationError extends Error {
  constructor(readonly status: 401 | 403) {
    super(status === 401 ? "Sign in required." : "Owner access required.");
  }
}
