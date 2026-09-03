# YOGAAA.

Personal website of **Yoga Agustiansyah**: a long-term digital hub for software
development, AI, computer vision, research, products, experiments, and writing.

Planned domain: [yogaagustiansyah.my.id](https://yogaagustiansyah.my.id).

## Project status

Repository guidance, the architecture contract, the formal V1 PRD, the design system,
and the environment template are established. Foundational Calm Blue tokens,
typography, responsive layout utilities, focus, and reduced-motion CSS are in place.
The application still renders the Next.js starter homepage; its composition and
utility classes have not yet been migrated to the design system.
Approved backend dependencies, a lazy database client, Drizzle Kit configuration,
environment validation, and an owner-authorized Cloudinary media service are in place.
The content/auth schema and migrations are present. Owner login/logout, server
authorization, password change, database-backed rate limits, and a bootstrap CLI
are implemented. Secure image upload, metadata verification, private delivery,
reference inspection, and retryable deletion are implemented without a media-library
UI. Portfolio pages, content-management screens, and deployment remain pending.
Migrations/auth/media flows were tested only with
ephemeral PostgreSQL and a mocked Cloudinary boundary; no configured Aiven database
or Cloudinary account was contacted.

The intended system is CMS-first: routine content updates should eventually require
no source-code change, Git commit, or redeployment.

## Stack

- **Installed:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Geist,
  Geist Mono, npm, Drizzle ORM + Drizzle Kit, postgres.js, Better Auth, Zod,
  Cloudinary, Sharp, react-markdown, and remark-gfm.
- **Environment tooling:** `@next/env` lets Drizzle Kit load the same local
  environment as Next.js; no separate dotenv dependency is needed.
- **Auth tooling:** `server-only` enforces boundaries; development dependencies
  `tsx` and PGlite support the TypeScript bootstrap CLI and isolated PostgreSQL tests.
- **Deployment targets:** Aiven PostgreSQL, Cloudinary, and Vercel; live
  integrations and deployment configuration remain pending.

The CMS will have one owner and no public registration. See the architecture
contract for system boundaries and planned capabilities.

## Local development

Use Node.js 22 or newer and npm; Better Auth's dependency tree requires Node 22.
The current workspace uses Node.js 24.15.0 and npm 11.12.1. Install the locked
dependencies, then start the starter app:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The public starter and login page render
without service credentials. Functional authentication requires the database,
auth environment, reviewed migrations, and provisioned owner described below.

## Owner CMS access

Read [authentication setup](docs/authentication.md) and verify the database target
and TLS trust before running either command:

```bash
npm run db:migrate
npm run auth:bootstrap-owner
```

The bootstrap command reads the three `BOOTSTRAP_OWNER_*` inputs from `.env.local`
or securely injected environment values. It never overwrites an existing owner.
After success, remove `BOOTSTRAP_OWNER_PASSWORD` from Vercel and local environment
settings, sign in at `/admin/login`, and replace the temporary password at `/admin`.
Public signup is disabled. There is no email reset flow.

## Environment configuration

[.env.example](.env.example) defines integration variables with explicit
placeholders. When configuring integrations, put real local values in root
`.env.local`; Git ignores real environment files and allows only the example.
Do not overwrite an existing local environment file or commit real credentials.

Only `NEXT_PUBLIC_SITE_URL` is public. Database, authentication, Cloudinary, and
owner bootstrap credentials remain server-only. Remove `BOOTSTRAP_OWNER_PASSWORD`
from the production environment after owner provisioning succeeds. Next.js and the
Drizzle Kit configuration share `.env.local` without duplicated database
credentials. Drizzle resolves the project root from its config file and preserves
injected environment values. Do not run it with `NODE_ENV=test`, which skips
`.env.local`. Validation errors identify variables without printing their values.

Database and Cloudinary configuration is lazy; it is validated only when used.
Database TLS verification stays enabled. See [database infrastructure](docs/database.md)
for connection limits, Aiven CA trust, schema relationships, and migration safety.

See [the environment contract](docs/architecture.md#11-environment-variables) for
the full variable list and loading requirements.

## Validation commands

Run the applicable checks after meaningful code changes:

```bash
npm exec -- next typegen
npm exec -- tsc --noEmit
npm run lint
npm run build
npm run db:check
npm run test:auth
npm run test:media
```

`npm run start` serves a completed production build. Auth tests use an isolated
in-memory PostgreSQL engine and never load `.env.local`. They cover the real Better
Auth adapter/handler, owner guards, bootstrap safety, sessions, and rate limits.
Media tests use the same isolated database plus a mocked provider boundary; they do
not consume configured Aiven or Cloudinary resources.
The current `next/font/google` setup downloads Geist and Geist
Mono during compilation; builds require access to Google Fonts.
For documentation-only changes, check references, consistency,
environment safety, and `git diff --check`.

Database scripts are `db:generate`, `db:check`, `db:migrate`, and `db:studio`.
Generation and checking are local schema operations. Migration and Studio use the
configured database and require deliberate target verification. npm reports four
moderate advisories through Drizzle Kit's tooling chain;
see [the audit notes](docs/database.md#dependency-audit) before changing versions.

## Project documentation

- [AGENTS.md](AGENTS.md): canonical Codex instructions; read this first.
- [Architecture contract](docs/architecture.md): locked stack, public/admin routes,
  content architecture, security, media, theme, environment, and caching rules.
- [Portfolio PRD](docs/portfolio-prd.md): product vision, journeys, route requirements,
  logical content models, CMS/publishing behavior, V1 scope, and acceptance criteria.
- [Design system](docs/design-system.md): palette/contrast, typography, responsive
  layout, interaction, media guidance, and the future CMS theme allowlist.
  [Foundational CSS](app/globals.css) implements the semantic tokens and base utilities.
- [Database schema and infrastructure](docs/database.md): schema relationships,
  draft/public storage, migration workflows, environment loading, and verified TLS.
- [Authentication](docs/authentication.md): owner provisioning, route/mutation
  protection, session policy, password changes, tests, and recovery limitations.
- [Media service](docs/media.md): owner-only upload limits, Cloudinary delivery,
  persistence, reconciliation, references, deletion retries, and test boundaries.
- [CLAUDE.md](CLAUDE.md): compatibility pointer to the canonical instructions.

The deployment document is planned under `docs/`; its responsibility is mapped
in the architecture contract. Vercel is the deployment target; configuration is pending.
