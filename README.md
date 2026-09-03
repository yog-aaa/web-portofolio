# YOGAAA.

Personal website of **Yoga Agustiansyah**: a long-term digital hub for software
development, AI, computer vision, research, products, experiments, and writing.

Planned domain: [yogaagustiansyah.my.id](https://yogaagustiansyah.my.id).

## Project status

Repository guidance, the architecture contract, the formal V1 PRD, and the environment
template are established. The application still renders the Next.js starter homepage.
Portfolio pages, the owner CMS, database, authentication, media integration, and
deployment are not implemented yet.

The intended system is CMS-first: routine content updates should eventually require
no source-code change, Git commit, or redeployment.

## Stack

- **Installed:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Geist,
  Geist Mono, and npm.
- **Locked for implementation:** Aiven PostgreSQL, Drizzle ORM + Drizzle Kit,
  postgres.js, Better Auth email/password authentication, Cloudinary, and Vercel.

The CMS will have one owner and no public registration. See the architecture
contract for system boundaries and planned capabilities.

## Local development

Use Node.js 20.9 or newer and npm. The repository audit used Node.js 24.15.0 and
npm 11.12.1. Install the existing locked dependencies, then start the starter app:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The current starter does not require
database, authentication, or Cloudinary credentials.

## Environment configuration

[.env.example](.env.example) defines the future integration variables with explicit
placeholders. When configuring integrations, put real local values in root
`.env.local`; Git ignores real environment files and allows only the example.
Do not overwrite an existing local environment file or commit real credentials.

Only `NEXT_PUBLIC_SITE_URL` is public. Database, authentication, Cloudinary, and
owner bootstrap credentials remain server-only. Remove `BOOTSTRAP_OWNER_PASSWORD`
from the production environment after owner provisioning succeeds. Next.js and the
future Drizzle Kit configuration must share `.env.local` without duplicated
database credentials. These integration and provisioning flows are not implemented.

See [the environment contract](docs/architecture.md#11-environment-variables) for
the full variable list and loading requirements.

## Validation commands

Run the applicable checks after meaningful code changes:

```bash
npm exec -- next typegen
npm exec -- tsc --noEmit
npm run lint
npm run build
```

`npm run start` serves a completed production build. No automated test suite is
configured yet. For documentation-only changes, check references, consistency,
environment safety, and `git diff --check`.

## Project documentation

- [AGENTS.md](AGENTS.md): canonical Codex instructions; read this first.
- [Architecture contract](docs/architecture.md): locked stack, public/admin routes,
  content architecture, security, media, theme, environment, and caching rules.
- [Portfolio PRD](docs/portfolio-prd.md): product vision, journeys, route requirements,
  logical content models, CMS/publishing behavior, V1 scope, and acceptance criteria.
- [CLAUDE.md](CLAUDE.md): compatibility pointer to the canonical instructions.

The design-system, database, and deployment documents are planned under
`docs/`; their responsibilities are mapped in the architecture contract. Vercel
is the deployment target; deployment configuration is still pending.
