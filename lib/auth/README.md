# Authentication boundary

Better Auth is installed; an auth instance, adapter schema, route handler, owner
binding, and provisioning flow are not implemented yet. This folder will hold
server-only session and owner-authorization helpers after that design is approved.

Use Better Auth's own user/session/account structures and Drizzle adapter. Enable
email/password with public sign-up disabled at the API. Authorize the one persisted
owner ID server-side for every private read and mutation; a session alone is not
owner authorization. Do not add permissive placeholder guards or bootstrap routes.

Read [the auth contract](../../docs/architecture.md#8-better-auth-and-owner-identity)
before implementation. Normal operation must not require bootstrap credentials.
