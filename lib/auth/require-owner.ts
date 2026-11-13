import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/firebase/admin";
import { AuthorizationError, type OwnerIdentity, type OwnerPermission } from "./authorization";

export const OWNER_COOKIE = "yogaaa_owner_session";

export async function requireOwner(
  permission: OwnerPermission = "cms:read",
  requestHeaders?: Headers,
): Promise<OwnerIdentity> {
  // The single configured owner has every current CMS permission.
  void permission;
  const ownerUid = process.env.FIREBASE_OWNER_UID?.trim();
  if (!ownerUid) throw new Error("FIREBASE_OWNER_UID is required.");

  const rawCookie = (requestHeaders ?? await headers()).get("cookie") ?? "";
  const session = rawCookie.split(";").map(value => value.trim())
    .find(value => value.startsWith(`${OWNER_COOKIE}=`))?.slice(OWNER_COOKIE.length + 1);
  if (!session) throw new AuthorizationError(401);

  let decoded;
  try {
    decoded = await getServerAuth().verifySessionCookie(session, true);
  } catch {
    throw new AuthorizationError(401);
  }
  if (decoded.uid !== ownerUid) throw new AuthorizationError(403);

  return {
    id: decoded.uid,
    name: decoded.name || decoded.email?.split("@")[0] || "Owner",
    email: decoded.email || "",
    role: "owner",
  };
}

export async function requireOwnerPage() {
  try {
    return await requireOwner();
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) redirect("/admin/login");
    throw error;
  }
}
