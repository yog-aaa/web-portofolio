import "server-only";

import { eq } from "drizzle-orm";
import type { AuthDatabase } from "../database/connection";
import { ownerBinding } from "../database/schema/auth";

export async function findOwnerUserId(db: AuthDatabase): Promise<string | null> {
  const [binding] = await db.select({ userId: ownerBinding.userId })
    .from(ownerBinding).where(eq(ownerBinding.id, 1)).limit(1);
  return binding?.userId ?? null;
}
