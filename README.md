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
environment validation, and a Cloudinary configuration skeleton are in place.
The initial schema and generated migration are present. Portfolio pages, repository
queries, the owner CMS, authentication flows, media management, and deployment
are not implemented. No migration has been applied and no live service connection
has been attempted.

The intended system is CMS-first: routine content updates should eventually require
no source-code change, Git commit, or redeployment.

## Stack

- **Installed:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Geist,
  Geist Mono, npm, Drizzle ORM + Drizzle Kit, postgres.js, Better Auth, Zod,
  Cloudinary, react-markdown, and remark-gfm.
- **Environment tooling:** `@next/env` lets Drizzle Kit load the same local
  environment as Next.js; no separate dotenv dependency is needed.
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

Open [localhost:3000](http://localhost:3000). The current starter does not require
database, authentication, or Cloudinary credentials.

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
for connection limits, Aiven CA trust, schema relationships, migration safety, and pending auth work.

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
```

`npm run start` serves a completed production build. No automated test suite is
configured yet. The current `next/font/google` setup downloads Geist and Geist
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
- [CLAUDE.md](CLAUDE.md): compatibility pointer to the canonical instructions.

The deployment document is planned under `docs/`; its responsibility is mapped
in the architecture contract. Vercel is the deployment target; configuration is pending.
