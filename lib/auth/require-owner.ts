import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "../database/client";
import { getAuth } from "./server";
import { AuthorizationError, authorizeOwner, type OwnerPermission } from "./authorization";

export async function requireOwner(permission: OwnerPermission = "cms:read", requestHeaders?: Headers) {
  return authorizeOwner(getAuth(), getDatabase(), requestHeaders ?? await headers(), permission);
}

export async function requireOwnerPage() {
  try {
    return await requireOwner();
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/admin/login");
    throw new Error("Owner access is temporarily unavailable.");
  }
}
