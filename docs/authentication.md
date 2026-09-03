# Owner authentication

Status: implemented and tested with ephemeral PostgreSQL. Live Aiven migrations,
owner provisioning, ingress configuration, and deployment verification remain
operational steps. Follow the [architecture](architecture.md) and
[database migration/TLS guide](database.md) before connecting to a real service.

## Account and server boundaries

V1 has one owner and no public account system. Better Auth owns `user`, `account`,
`session`, and `verification`; `owner_binding` holds the stable authorized user ID.
The ordinary Profile and CMS settings cannot grant or transfer ownership.

`/admin/login` provides Email, Password, and Sign In. There are no social-login,
signup, or password-reset links. `/admin` currently contains a small authenticated
shell and password-change form; content-management screens remain future work.

- `proxy.ts` checks a real session and owner binding for `/admin/:path*`, except
  exact `/admin/login`. Nested and unimplemented admin paths are covered. Missing,
  forged, expired, or revoked sessions redirect to login. Authenticated non-owners
  receive 403; infrastructure failures return 503 without serving private content.
- Protected layouts/pages also call `requireOwnerPage()`. Layouts cannot protect
  callable operations. Every future private service, Server Action, or Route
  Handler must independently call `requireOwner("cms:read")` or
  `requireOwner("cms:write")` before private data access. Handle
  `AuthorizationError` as 401/403; never catch it and proceed with an operation.
- `authorizeOwner()` checks persisted identity on each call, without a cookie
  cache. It returns only ID, name, email, and server-derived role. The small owner
  permission map (`cms:read`, `cms:write`, `account:manage`) permits later roles
  without implementing role tables or trusting browser claims.
- Better Auth's session-create hook denies unexpected non-owner accounts. The
  independent owner guard also rejects any existing non-owner session.
- The auth HTTP boundary allows `POST /sign-in/email`, `GET /get-session`,
  `POST /sign-out`, `POST /change-password`, and `POST /sign-up/email`. The last
  is rejected by Better Auth's supported `disableSignUp: true` configuration.
  All other auth endpoints return 404. Sign-out/password-change handlers require
  `account:manage` independently of the page or proxy.
- The hosted auth instance always disables signup. There is no environment switch
  to open registration, no bootstrap route, and no startup/build provisioning.

Better Auth HTTP requests retain origin/CSRF checks and rate limiting. Direct
server `auth.api` calls bypass the HTTP limiter; do not move login into a Server
Action without supplying equivalent protection. See the official
[Next.js integration](https://better-auth.com/docs/integrations/next) and
[rate-limit guide](https://better-auth.com/docs/concepts/rate-limit).

## Session and request policy

- Sessions have a fixed 12-hour expiry, no sliding renewal, and no cookie cache.
  Cookie flags are HttpOnly, SameSite=Lax, and Secure on HTTPS. Session tokens are
  never put into localStorage by application code.
- `BETTER_AUTH_URL` specifies the sole allowed origin. It must be HTTPS except
  for loopback development/preview servers. Auth secrets must be at least 32
  characters; generate them with a cryptographically secure tool.
- Logout revokes the database session. Password change uses Better Auth's current
  password verification. The form requests revocation of previous sessions and
  receives a new session cookie after success.
- The PostgreSQL-backed rate limiter allows five sign-in/password-change requests
  per IP in a 60-second window and 60 general auth requests per minute. It remains
  enabled in development and shares counters across Vercel instances.
- IP detection uses the ingress-provided single `x-forwarded-for` value. Before
  deployment, verify the trusted ingress overwrites that header and the origin
  cannot be reached through an untrusted forwarding path. Do not trust arbitrary
  forwarded chains or disable CSRF/IP tracking. When no trusted IP is resolved,
  Better Auth uses one shared per-path rate bucket instead of skipping the limit.
- Admin/auth responses use `private, no-store` and noindex headers; admin metadata
  also excludes indexing. These controls supplement server authorization.
- Application/Better Auth logging omits passwords, secrets, session tokens, raw
  provider responses and driver exceptions. Runtime infrastructure failures are
  reported using generic messages. The public website does not initialize auth.

## One-time owner provisioning

1. Verify the intended Aiven database and TLS trust. Review backups and committed
   SQL, then deliberately apply migrations as described in [database.md](database.md).
   Both `0000_initial_schema.sql` and `0001_auth_rate_limit.sql` are required.
   Bootstrap never creates tables or runs migrations.
2. Set `DATABASE_URL`, `DATABASE_CA_CERT_BASE64`, `BETTER_AUTH_URL`, and
   `BETTER_AUTH_SECRET` through `.env.local` or secure process injection. Set temporary
   `BOOTSTRAP_OWNER_NAME`, `BOOTSTRAP_OWNER_EMAIL`, and `BOOTSTRAP_OWNER_PASSWORD`
   (12–128 characters).
   Never pass passwords or connection strings as command-line arguments.
3. Run from the repository:

   ```bash
   npm run auth:bootstrap-owner
   ```

   The CLI uses `@next/env` to load the same `.env.local` as Next.js, preserving
   injected values. `NODE_ENV=production` selects production precedence; test
   mode is rejected. Run in a trusted operational environment with access to
   the verified database. Never add this command to Vercel build/start scripts.
4. A transaction-scoped PostgreSQL advisory lock serializes provisioning. A
   CLI-only Better Auth instance uses supported `api.signUpEmail` with automatic
   sign-in disabled. It hashes the password and creates the user/credential
   account in the same transaction as `owner_binding`. Failure rolls back all
   records. The CLI issues no session and closes its database connection.
5. Rerunning with the same owner's inputs returns `already-provisioned` without
   resetting the password/name or creating an account. Conflicting ownership or
   pre-existing unbound users is refused. Bootstrap never silently adopts,
   deletes, or reassigns an identity. Inputs are validated even on a rerun.
6. After successful production bootstrap, **remove `BOOTSTRAP_OWNER_PASSWORD`
   from Vercel environment variables** and remove temporary local/process values.
   Normal login and authorization do not read bootstrap variables. Sign in at
   `/admin/login`, then use `/admin` → Change password to replace the temporary
   password. Store the new password securely.

## Recovery

There is no email password-reset workflow. When the current password is known,
use the authenticated Change password form. If credentials are lost, bootstrap
must still refuse to overwrite the owner. Recovery requires a separately reviewed
offline procedure that verifies ownership, uses Better Auth-supported password
handling, preserves the stable binding, and revokes sessions. Do not delete auth
rows or manually write plaintext/hash values as an improvised recovery path.
An offline recovery procedure and deployment rehearsal remain launch gates.

## Validation

```bash
npm run test:auth
npm exec -- next typegen
npm exec -- tsc --noEmit
npm run lint
npm run build
npm run db:check
```

Auth tests apply the committed SQL to disposable in-memory PGlite PostgreSQL.
They use generated test secrets, never load `.env.local`, and exercise the real
Better Auth Drizzle adapter, HTTP boundary, and server gate. Coverage includes
anonymous admin requests, invalid/successful login, secure cookies, session
expiry/logout, signup rejection, cross-origin denial, non-owner authorization,
password changes, atomic bootstrap rollback, rerun/concurrent provisioning, and
concurrent rate limiting across auth instances.

PGlite is a development-only test engine; runtime persistence remains postgres.js
and Aiven PostgreSQL. These tests do not verify postgres.js network/TLS behavior,
Vercel ingress headers, Aiven availability, or production deployment.
