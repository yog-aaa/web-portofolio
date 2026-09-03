import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, sql } from "drizzle-orm";
import type { AuthDatabase } from "../../lib/database/connection";
import { account, ownerBinding, session, user, verification } from "../../lib/database/schema/auth";
import { baseAuthOptions, type AuthEnvironment } from "../../lib/auth/options";
import type { parseBootstrapEnvironment } from "../../lib/validation/environment";

type BootstrapInput = ReturnType<typeof parseBootstrapEnvironment>;

export class BootstrapConflict extends Error {
  constructor() {
    super("Owner provisioning refused: existing authentication state needs manual review. Nothing was changed.");
  }
}

/** CLI-only; never import into the hosted application or expose its auth handler. */
export async function provisionOwner(db: AuthDatabase, environment: AuthEnvironment, input: BootstrapInput) {
  return db.transaction(async (tx) => {
    // Serialize concurrent bootstrap commands; the binding and auth rows commit together.
    await tx.execute(sql`select pg_advisory_xact_lock(19880711, 1)`);
    const bindings = await tx.select().from(ownerBinding);
    const users = await tx.select({ id: user.id, email: user.email }).from(user).limit(2);
    const existing = bindings[0];
    if (existing) {
      const [credential] = await tx.select({ password: account.password }).from(account)
        .where(and(eq(account.userId, existing.userId), eq(account.providerId, "credential"))).limit(1);
      if (bindings.length === 1 && users.length === 1 && users[0].id === existing.userId &&
        users[0].email.toLowerCase() === input.BOOTSTRAP_OWNER_EMAIL && credential?.password) {
        return "already-provisioned" as const;
      }
      throw new BootstrapConflict();
    }
    if (users.length || (await tx.select({ id: account.id }).from(account).limit(1)).length) {
      throw new BootstrapConflict();
    }

    // Only this isolated instance permits Better Auth's supported email signup API.
    // All writes use the surrounding transaction; no session is created.
    const options = baseAuthOptions(environment);
    const bootstrapAuth = betterAuth({
      ...options,
      database: drizzleAdapter(tx, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { ...options.emailAndPassword, disableSignUp: false, autoSignIn: false },
      rateLimit: { enabled: false },
    });
    const created = await bootstrapAuth.api.signUpEmail({ body: {
      name: input.BOOTSTRAP_OWNER_NAME,
      email: input.BOOTSTRAP_OWNER_EMAIL,
      password: input.BOOTSTRAP_OWNER_PASSWORD,
    } });
    const [persisted] = await tx.select({ id: user.id }).from(user).where(eq(user.id, created.user.id));
    const [credential] = await tx.select({ id: account.id }).from(account)
      .where(and(eq(account.userId, created.user.id), eq(account.providerId, "credential")));
    if (!persisted || !credential || created.token !== null) throw new BootstrapConflict();
    await tx.insert(ownerBinding).values({ id: 1, userId: persisted.id });
    return "created" as const;
  });
}
