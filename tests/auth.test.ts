import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NextRequest } from "next/server";
import * as schema from "../lib/database/schema";
import { createAuth } from "../lib/auth/create-auth";
import { createAuthHttpHandler } from "../lib/auth/http";
import { AuthorizationError, authorizeOwner } from "../lib/auth/authorization";
import { createAdminGate } from "../lib/auth/admin-gate";
import { baseAuthOptions } from "../lib/auth/options";
import { parseAuthEnvironment, parseBootstrapEnvironment } from "../lib/validation/environment";
import { BootstrapConflict, provisionOwner } from "../scripts/auth/bootstrap";

// Never load .env.local or use getDatabase(): all SQL runs in ephemeral WASM PostgreSQL.
const environment = parseAuthEnvironment({
  BETTER_AUTH_URL: "https://yogaaa.test", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
});
const input = parseBootstrapEnvironment({
  BOOTSTRAP_OWNER_NAME: "Test Owner", BOOTSTRAP_OWNER_EMAIL: "owner@example.test",
  BOOTSTRAP_OWNER_PASSWORD: randomBytes(24).toString("base64url"),
});
const origin = environment.BETTER_AUTH_URL;

async function fixture() {
  const client = new PGlite();
  const directory = resolve(__dirname, "../drizzle");
  for (const file of (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort()) {
    await client.exec(await readFile(resolve(directory, file), "utf8"));
  }
  const db = drizzle(client, { schema });
  const auth = createAuth(db, environment);
  const handler = createAuthHttpHandler(auth, db);
  const gate = createAdminGate((headers) => authorizeOwner(auth, db, headers));
  let requestIndex = 0;
  function request(path: string, body?: Record<string, unknown>, cookie = "", ip?: string, requestOrigin = origin) {
    return new Request(`${origin}/api/auth${path}`, {
      method: body ? "POST" : "GET",
      headers: { "content-type": "application/json", origin: requestOrigin, cookie,
        "x-forwarded-for": ip ?? `192.0.2.${++requestIndex}` },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  const signIn = (password = input.BOOTSTRAP_OWNER_PASSWORD) => handler(request("/sign-in/email", {
    email: input.BOOTSTRAP_OWNER_EMAIL, password,
  }));
  return { client, db, auth, handler, gate, request, signIn };
}

function cookieFrom(response: Response) {
  return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
}
function denied(status: 401 | 403) {
  return (error: unknown) => error instanceof AuthorizationError && error.status === status;
}

test("owner login, session, logout, signup and server authorization", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await provisionOwner(f.db, environment, input);

  await t.test("every private admin path redirects without a session; login stays accessible", async () => {
    for (const path of ["", "/projects", "/experience", "/research", "/thoughts", "/credentials", "/media", "/settings", "/settings/theme", "/future/nested"]) {
      const response = await f.gate(new NextRequest(`${origin}/admin${path}`));
      assert.equal(response.status, 303);
      assert.equal(response.headers.get("location"), `${origin}/admin/login`);
      assert.match(response.headers.get("cache-control")!, /no-store/);
    }
    assert.equal((await f.gate(new NextRequest(`${origin}/admin/login`))).status, 200);
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers(), "cms:write"), denied(401));
    assert.equal((await f.handler(f.request("/change-password", { currentPassword: "unused", newPassword: "unused" }))).status, 401);
  });

  await t.test("signup disabled at Better Auth API; unrelated endpoints unavailable", async () => {
    const response = await f.handler(f.request("/sign-up/email", {
      name: "Visitor", email: "visitor@example.test", password: randomBytes(24).toString("hex"),
    }));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "EMAIL_PASSWORD_SIGN_UP_DISABLED");
    await assert.rejects(f.auth.api.signUpEmail({ body: {
      name: "Visitor", email: "visitor@example.test", password: randomBytes(24).toString("hex"),
    } }));
    assert.equal((await f.db.select().from(schema.user)).length, 1);
    for (const path of ["/sign-in/social", "/request-password-reset", "/update-user", "/delete-user"]) {
      assert.equal((await f.handler(f.request(path, {}))).status, 404);
    }
  });

  await t.test("failed login and cross-origin login cannot create a session", async () => {
    assert.equal((await f.signIn(randomBytes(24).toString("hex"))).status, 401);
    const crossOrigin = await f.handler(f.request("/sign-in/email", {
      email: input.BOOTSTRAP_OWNER_EMAIL, password: input.BOOTSTRAP_OWNER_PASSWORD,
    }, "", undefined, "https://attacker.test"));
    assert.equal(crossOrigin.status, 403);
    assert.equal((await f.db.select().from(schema.session)).length, 0);
  });

  let cookie = "";
  await t.test("successful login sets secure cookies and resolves persisted owner", async () => {
    const response = await f.signIn();
    assert.equal(response.status, 200);
    const setCookie = response.headers.get("set-cookie")!;
    assert.match(setCookie, /httponly/i);
    assert.match(setCookie, /secure/i);
    assert.match(setCookie, /samesite=lax/i);
    cookie = cookieFrom(response);
    const session = await f.handler(f.request("/get-session", undefined, cookie));
    assert.equal((await session.json()).user.email, input.BOOTSTRAP_OWNER_EMAIL);
    const owner = await authorizeOwner(f.auth, f.db, new Headers({ cookie }), "cms:write");
    assert.equal(owner.role, "owner");
    assert.equal("token" in owner, false);
    assert.equal((await f.gate(new NextRequest(`${origin}/admin`, { headers: { cookie } }))).status, 200);
  });

  await t.test("forged, expired and revoked sessions fail server checks", async () => {
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie: "__Secure-yogaaa.session_token=forged" })), denied(401));
    const secondCookie = cookieFrom(await f.signIn());
    const secondSession = await f.auth.api.getSession({ headers: new Headers({ cookie: secondCookie }) });
    assert.ok(secondSession);
    await f.db.update(schema.session).set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.session.id, secondSession.session.id));
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie: secondCookie })), denied(401));
    const logout = await f.handler(f.request("/sign-out", {}, cookie));
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie")!, /max-age=0/i);
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie })), denied(401));
  });

  await t.test("password change requires current password and revokes previous sessions", async () => {
    const first = cookieFrom(await f.signIn());
    const second = cookieFrom(await f.signIn());
    const newPassword = randomBytes(24).toString("base64url");
    const wrong = await f.handler(f.request("/change-password", {
      currentPassword: randomBytes(24).toString("hex"), newPassword, revokeOtherSessions: true,
    }, first));
    assert.equal(wrong.status, 400);
    const response = await f.handler(f.request("/change-password", {
      currentPassword: input.BOOTSTRAP_OWNER_PASSWORD, newPassword, revokeOtherSessions: true,
    }, first));
    assert.equal(response.status, 200);
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie: first })), denied(401));
    await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie: second })), denied(401));
    assert.equal((await f.signIn()).status, 401);
    assert.equal((await f.signIn(newPassword)).status, 200);
    assert.equal((await authorizeOwner(f.auth, f.db, new Headers({ cookie: cookieFrom(response) }))).role, "owner");
  });
});

test("existing authenticated non-owner cannot obtain CMS access or mutate accounts", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await provisionOwner(f.db, environment, input);
  // Isolated fixture simulates unexpected legacy/imported auth records using Better Auth.
  const options = baseAuthOptions(environment);
  const fixtureAuth = betterAuth({
    ...options,
    database: drizzleAdapter(f.db, { provider: "pg", schema }),
    emailAndPassword: { ...options.emailAndPassword, disableSignUp: false },
    rateLimit: { enabled: false },
  });
  const password = randomBytes(24).toString("base64url");
  await fixtureAuth.api.signUpEmail({ body: { name: "Not Owner", email: "visitor@example.test", password } });
  const loginRequest = f.request("/sign-in/email", { email: "visitor@example.test", password });
  const fixtureSession = await fixtureAuth.handler(loginRequest);
  assert.equal(fixtureSession.status, 200);
  const cookie = cookieFrom(fixtureSession);
  await assert.rejects(authorizeOwner(f.auth, f.db, new Headers({ cookie, "x-role": "owner" }), "cms:write"), denied(403));
  assert.equal((await f.gate(new NextRequest(`${origin}/admin/settings`, { headers: { cookie } }))).status, 403);
  assert.equal((await f.handler(f.request("/change-password", { currentPassword: password, newPassword: randomBytes(24).toString("hex") }, cookie))).status, 403);
  assert.equal((await f.handler(f.request("/sign-in/email", { email: "visitor@example.test", password }))).status, 401);
});

test("bootstrap is atomic, idempotent, serialized and refuses conflicting ownership", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  const results = await Promise.all([provisionOwner(f.db, environment, input), provisionOwner(f.db, environment, input)]);
  assert.deepEqual(results.sort(), ["already-provisioned", "created"]);
  const [before] = await f.db.select().from(schema.account);
  assert.ok(before.password && before.password !== input.BOOTSTRAP_OWNER_PASSWORD);
  assert.equal(await provisionOwner(f.db, environment, { ...input, BOOTSTRAP_OWNER_PASSWORD: randomBytes(24).toString("hex") }), "already-provisioned");
  assert.deepEqual(await f.db.select().from(schema.account), [before]);
  await assert.rejects(provisionOwner(f.db, environment, { ...input, BOOTSTRAP_OWNER_EMAIL: "another@example.test" }), BootstrapConflict);
  assert.equal((await f.db.select().from(schema.user)).length, 1);
  assert.equal((await f.db.select().from(schema.ownerBinding)).length, 1);
  assert.equal((await f.db.select().from(schema.session)).length, 0);
  await f.db.delete(schema.ownerBinding);
  await assert.rejects(provisionOwner(f.db, environment, input), BootstrapConflict);
});

test("failed binding rolls back both Better Auth user and credential account", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await f.client.exec(`CREATE FUNCTION reject_binding() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'injected test failure'; END $$;
    CREATE TRIGGER reject_binding BEFORE INSERT ON owner_binding FOR EACH ROW EXECUTE FUNCTION reject_binding();`);
  await assert.rejects(provisionOwner(f.db, environment, input));
  assert.equal((await f.db.select().from(schema.user)).length, 0);
  assert.equal((await f.db.select().from(schema.account)).length, 0);
  assert.equal((await f.db.select().from(schema.ownerBinding)).length, 0);
});

test("login rate limiting persists across auth instances and concurrent requests", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await provisionOwner(f.db, environment, input);
  const secondHandler = createAuthHttpHandler(createAuth(f.db, environment), f.db);
  const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => (i % 2 ? f.handler : secondHandler)(
    f.request("/sign-in/email", { email: input.BOOTSTRAP_OWNER_EMAIL, password: randomBytes(24).toString("hex") }, "", "198.51.100.10"),
  )));
  assert.equal(responses.filter((response) => response.status === 401).length, 5);
  assert.equal(responses.filter((response) => response.status === 429).length, 3);
  assert.ok(responses.find((response) => response.status === 429)?.headers.get("x-retry-after"));
});
