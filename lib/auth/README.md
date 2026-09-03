# Authentication boundary

Better Auth uses the Drizzle adapter, email/password, and the persisted owner binding.
`getAuth()` initializes lazily. `requireOwner()` verifies both a database session
and owner authorization at each private server boundary. `requireOwnerPage()` is
the page redirect wrapper. Neither bootstrap values nor client role flags grant access.

`http.ts` exposes a small auth endpoint allowlist with independent checks for account
mutations. `client.ts` is the only browser module. Provisioning lives under
`scripts/auth/` and must never be imported into the hosted application.

Use Better Auth's own user/session/account structures and Drizzle adapter. Enable
email/password with public sign-up disabled at the API. Authorize the one persisted
owner ID server-side for every private read and mutation; a session alone is not
owner authorization. Do not add permissive placeholder guards or bootstrap routes.

Read [the auth contract](../../docs/architecture.md#8-better-auth-and-owner-identity)
and [authentication operations](../../docs/authentication.md). Normal operation
must not require bootstrap credentials.
