# YOGAAA.

Personal website of **Yoga Agustiansyah**: a long-term digital hub for software
development, AI, computer vision, research, products, experiments, and writing.

Planned domain: [yogaagustiansyah.my.id](https://yogaagustiansyah.my.id).

## Project status

Repository guidance, the architecture contract, the formal V1 PRD, the design system,
and the environment template are established. Foundational Calm Blue tokens,
typography, responsive layout utilities, focus, and reduced-motion CSS are in place.
The public shell and CMS-driven homepage now implement the Calm Blue editorial
system with sticky responsive navigation, reusable UI primitives, and the curated
Hero → Work → Experience → Education → Research → Thoughts → About → Contact hierarchy.
Education shows up to three visible profile entries and links to `/about#education`.
Its heading, introduction, and action label are editable under Site Settings →
Homepage section copy → Education; clearing the heading hides the section.
Approved backend dependencies, a lazy database client, Drizzle Kit configuration,
environment validation, and an owner-authorized Cloudinary media service are in place.
The content/auth schema and migrations are present. The Work archive and case-study,
Experience, About, and Credentials public routes now use the typed content layer,
editable route settings, safe Markdown, semantic tokens, and bounded URL-driven
archive filters. Owner login/logout, server authorization, password change,
database-backed rate limits, and a bootstrap CLI
are implemented. Owner-authorized signed image uploads now go directly to Cloudinary
with a 10 MiB limit, followed by server metadata verification and normal
`media_assets` persistence. Primary portrait, project/research/Thought covers, and
credential previews support inline upload-and-select; the Media Library continues
to provide metadata editing, reference inspection, and safe deletion.
Typed public content queries now enforce publication, visibility, relationship-slot,
and media-access rules. Research and Thoughts now provide bounded archives,
safe long-form detail views, managed figures, derived reading time, and private-state
protection. The authenticated owner workspace now manages Projects, Experience,
Research, Thoughts, and Credentials with private drafts, safe previews, publishing,
withdrawal, visibility, media selection, validation, and stale-write protection.
Reusable project categories and technologies now have a dedicated owner-only
Master data workspace with usage-aware deletion. Site settings, contact/social management, and the safe semantic theme
editor are implemented. The homepage hero supports a CMS-selected square or 3:4
portrait in an adaptive editorial frame, plus primary Work and secondary Contact
actions. Site settings provide repeatable social-profile rows with a searchable,
code-owned icon catalogue, and those icons appear in public contact areas. Production SEO now includes stable canonicals, Open Graph
and social metadata, published-only sitemap entries, robots policy, and escaped
structured data for identity, work, research, and Thoughts. Public read models use
persistent tagged caching with immediate CMS invalidation, and production responses
include baseline anti-framing, MIME, referrer, and permissions headers. Deployment
remains pending. Database integration is configured; apply every reviewed migration,
including the Education section-copy migration, before saving homepage settings or running public queries
against an existing Aiven database. Auth, media, content, and settings
behavior has isolated PostgreSQL coverage;
Live Aiven, Cloudinary, custom-domain, and production deployment verification remain pending.

The intended system is CMS-first: routine content updates should eventually require
no source-code change, Git commit, or redeployment.

## Stack

- **Installed:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Geist,
  Geist Mono, npm, Drizzle ORM + Drizzle Kit, postgres.js, Better Auth, Zod,
  Cloudinary, Sharp, react-markdown, and remark-gfm.
- **Environment tooling:** `@next/env` lets Drizzle Kit load the same local
  environment as Next.js; the Aiven CA is supplied as validated Base64 trust
  material, with no separate dotenv dependency or deployed certificate file.
- **Auth tooling:** `server-only` enforces boundaries; development dependencies
  `tsx` and PGlite support the TypeScript bootstrap CLI and isolated PostgreSQL tests.
- **Deployment targets:** Aiven PostgreSQL, Cloudinary, and Vercel; the release
  runbook is present while live integrations and deployment remain pending.

The CMS has one owner and no public registration. See the architecture
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

## Development content seed

After reviewing and applying migrations to a verified development database, seed
the known profile and education, route copy, Calm Blue theme, Work filters,
technology catalogue, the supplied fall-detection project/research drafts, and
private placeholders for otherwise unknown content:

```bash
npm run db:seed:development -- --confirm-development
```

The command is never run by startup or build. It refuses production/test mode,
does not overwrite or delete existing rows, and is safe to rerun. The known
fall-detection project and research remain drafts because publication facts such
as the owner's role were not supplied. Unknown experience, credential, social,
and Thought examples are explicitly labelled and remain hidden or draft. Replace
or remove them before publishing. GPA and media are never fabricated; media must
be uploaded through the authenticated Cloudinary flow.

## Environment configuration

[.env.example](.env.example) defines integration variables with explicit
placeholders. When configuring integrations, put real local values in root
`.env.local`; Git ignores real environment files and allows only the example.
Do not overwrite an existing local environment file or commit real credentials.

Only `NEXT_PUBLIC_SITE_URL` is public. Database, authentication, Cloudinary, and
owner bootstrap credentials remain server-only. Remove `BOOTSTRAP_OWNER_PASSWORD`
from the production environment after owner provisioning succeeds. Next.js and the
Drizzle Kit configuration share `.env.local` without duplicated database
credentials. Set `DATABASE_CA_CERT_BASE64` to the one-line Base64 encoding of the
Aiven `ca.pem`; the runtime and Drizzle Kit validate and decode it without writing
a certificate file. Drizzle resolves the project root from its config file and
preserves injected environment values. Do not run it with `NODE_ENV=test`, which
skips `.env.local`. Validation errors identify variables without printing values.

Database and Cloudinary configuration is lazy; it is validated only when used.
Database TLS verification stays enabled. See [database infrastructure](docs/database.md)
for connection limits, Aiven CA trust, schema relationships, and migration safety.

See [the environment contract](docs/architecture.md#11-environment-variables) for
the full variable list and loading requirements.
See [the deployment runbook](docs/deployment.md) for Production/Preview scopes,
migrations, Vercel configuration, Hostinger DNS, owner bootstrap, and live checks.

## Validation commands

Run the applicable checks after meaningful code changes:

```bash
npm exec -- next typegen
npm exec -- tsc --noEmit
npm run lint
npm run build
npm run db:check
npm run test:database
npm run test:auth
npm run test:media
npm run test:content
npm run test:admin
npm run test:settings
npm run test:ui
```

`npm run start` serves a completed production build. Auth tests use an isolated
in-memory PostgreSQL engine and never load `.env.local`. They cover the real Better
Auth adapter/handler, owner guards, bootstrap safety, sessions, and rate limits.
Media tests use the same isolated database plus a mocked provider boundary; they do
not consume configured Aiven or Cloudinary resources.
Content tests cover every public query's draft/archive/visibility/media boundary,
route-level settings, public GPA handling, and
the non-destructive seed. The seed command itself connects to `DATABASE_URL`; verify
the target before using its required confirmation flag.
Admin tests cover independent read/write authorization, private-draft isolation,
publication and withdrawal, optimistic concurrency, media access, collection CRUD,
and usage-safe taxonomy management.
The UI tests verify CMS copy injection, featured-research promotion into the
Selected Work composition, archive filtering, Project/Research section parsing,
Thought metadata and reading-time derivation, managed Markdown media, and
raw-HTML/unsafe-link rejection. They also cover production canonicals, robots,
escaped JSON-LD, and keyboard-scrollable Markdown tables. Public pages are request-rendered and require the current
migrations plus configured public content at runtime.
The current `next/font/google` setup downloads Geist and Geist
Mono during compilation; builds require access to Google Fonts.
For documentation-only changes, check references, consistency,
environment safety, and `git diff --check`.

Database scripts are `db:generate`, `db:check`, `db:migrate`, and `db:studio`.
Generation and checking are local schema operations. `db:migrate` uses Drizzle ORM's
postgres.js migrator so it shares the application's validated TLS configuration and
prints an explicit success result. Migration and Studio use the configured database
and require deliberate target verification plus a database user that can create the
Drizzle journal schema and application objects. npm reports four
moderate advisories through Drizzle Kit's tooling chain;
see [the audit notes](docs/database.md#dependency-audit) before changing versions.

## Project documentation

- [AGENTS.md](AGENTS.md): canonical Codex instructions; read this first.
- [Architecture contract](docs/architecture.md): locked stack, public/admin routes,
  content architecture, security, media, theme, environment, and caching rules.
- [Portfolio PRD](docs/portfolio-prd.md): product vision, journeys, route requirements,
  logical content models, CMS/publishing behavior, V1 scope, and acceptance criteria.
- [Design system](docs/design-system.md): palette/contrast, typography, responsive
  layout, interaction, media guidance, and the CMS theme allowlist.
  [Foundational CSS](app/globals.css) implements the semantic tokens and base utilities.
- [Database schema and infrastructure](docs/database.md): schema relationships,
  draft/public storage, migration workflows, environment loading, and verified TLS.
- [Authentication](docs/authentication.md): owner provisioning, route/mutation
  protection, session policy, password changes, tests, and recovery limitations.
- [Media service](docs/media.md): owner-only library, upload limits, Cloudinary
  delivery, metadata, references, deletion retries, and test boundaries.
- [Public content queries](docs/content-queries.md): public DTOs, visibility rules,
  ordering, query functions, and the guarded development seed.
- [Owner CMS](docs/cms.md): content, media, settings/theme screens, draft/public
  lifecycle, validation, optimistic concurrency, and refresh behavior.
- [Deployment runbook](docs/deployment.md): Aiven, migrations, Cloudinary, Vercel
  environment scopes, Hostinger DNS, owner bootstrap, and production verification.
- [CLAUDE.md](CLAUDE.md): compatibility pointer to the canonical instructions.
