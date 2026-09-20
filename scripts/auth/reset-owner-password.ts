import "server-only";

import { hashPassword } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import type { AuthDatabase } from "../../lib/database/connection";
import { account, ownerBinding, session, user } from "../../lib/database/schema/auth";
import type { parseOwnerPasswordResetEnvironment } from "../../lib/validation/environment";

type OwnerPasswordResetInput = ReturnType<typeof parseOwnerPasswordResetEnvironment>;

export class OwnerPasswordResetConflict extends Error {
  constructor() {
    super("Owner password reset refused: the bound owner state or confirmation email did not match. Nothing was changed.");
  }
}

/** CLI-only recovery operation; never expose through the hosted application. */
export async function resetOwnerPassword(db: AuthDatabase, input: OwnerPasswordResetInput) {
  const password = await hashPassword(input.RESET_OWNER_PASSWORD);

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(19880711, 1)`);
    const bindings = await tx.select({ userId: ownerBinding.userId, email: user.email })
      .from(ownerBinding).innerJoin(user, eq(user.id, ownerBinding.userId)).limit(2);
    const owner = bindings[0];
    if (bindings.length !== 1 || !owner || owner.email.toLowerCase() !== input.RESET_OWNER_EMAIL) {
      throw new OwnerPasswordResetConflict();
    }

    const credentials = await tx.select({ id: account.id, accountId: account.accountId, password: account.password })
      .from(account).where(and(
        eq(account.userId, owner.userId),
        eq(account.providerId, "credential"),
        eq(account.issuer, "local:credential"),
      )).limit(2);
    const credential = credentials[0];
    if (credentials.length !== 1 || !credential?.password || credential.accountId !== owner.userId) {
      throw new OwnerPasswordResetConflict();
    }

    const [updated] = await tx.update(account).set({ password }).where(eq(account.id, credential.id))
      .returning({ id: account.id });
    if (!updated) throw new OwnerPasswordResetConflict();
    await tx.delete(session).where(eq(session.userId, owner.userId));

    return { userId: owner.userId };
  });
}
