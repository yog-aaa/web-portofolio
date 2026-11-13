# YOGAAA.

Personal website of **Yoga Agustiansyah**: a long-term digital hub for software
development, AI, computer vision, research, products, experiments, and writing.

Planned domain: [yogaagustiansyah.my.id](https://yogaagustiansyah.my.id).

## Project status

The `feat/porto-v2-landing` branch contains the approved Porto V2 public slice:
the homepage, Work and three case studies, Experience, About, Credentials, Research,
and Thoughts. It includes the supplied portrait and project artwork, Cream + Ink and
Charcoal + Sand themes, responsive layouts, intro motion, and the theme switch.
The owner CMS now has the V2 visual shell, sidebar, overview, login, and themed
existing editors. Education and Homepage & Profile are static design slices.
The development-only `/preview/cms` route lets the complete 12-screen CMS design be
reviewed without connecting the old database or signing in; it is read-only and
returns 404 in production.
See [Porto V2 slicing](docs/porto-v2-slicing.md) for the route map, responsive
behavior, validation, and the current CMS integration boundary.

Public V2 content is temporarily code-owned; the planned Firebase CMS migration
will replace it with published read models. The existing owner workflows still use
PostgreSQL/Better Auth, so CMS persistence and login have not been migrated yet.
The former homepage component remains in `components/home/` for migration reference.

Repository guidance, the architecture contract, the formal V1 PRD, the design system,
and the environment template are established. Foundational Calm Blue tokens,
typography, responsive layout utilities, focus, and reduced-motion CSS are in place.
The V1 public shell and former CMS-driven homepage implement the Calm Blue editorial
system with sticky responsive navigation, reusable UI primitives, and the curated
Hero → Work → Experience → Education → Research → Thoughts → About → Contact hierarchy.
Education shows up to three visible profile entries and links to `/about#education`.
Its heading, introduction, and action label are editable under Site Settings →
Homepage section copy → Education; clearing the heading hides the section.
Experience and Education use a shared responsive timeline on Home, Experience,
and About, with date labels and a marker for each entry. Entries animate once when
they enter the viewport, highlight on hover or keyboard focus, and offer expandable
details when additional content exists. Reduced-motion preferences are respected;
content and native detail controls remain usable without JavaScript.
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
editor are implemented. The former V1 homepage hero supports a CMS-selected square or 3:4
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

## Planned migration

The next architecture change will replace Aiven PostgreSQL and Better Auth with
Cloud Firestore and Firebase Authentication while retaining Cloudinary. The current
application still uses PostgreSQL; no Firebase runtime has been implemented yet.
Porto V2 design content will become the new seed; existing development samples
will not be migrated. Review the [Firestore migration design](docs/superpowers/specs/2026-11-12-firestore-migration-design.md)
before implementation.

## Stack

- **Installed:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Geist,
  Geist Mono, npm, Drizzle ORM + Drizzle Kit, postgres.js, Better Auth, Zod,
  Cloudinary, Firebase SDK, Firebase Admin SDK, Sharp, react-markdown, and remark-gfm.
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

Use Node.js 24.12 or newer and npm; the Firebase dependencies require Node 24.12.
The current workspace uses Node.js 24.15.0 and npm 11.12.1. Install the locked
dependencies, then start the app:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The Porto V2 homepage and login page render
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

If the current password is lost, follow the owner-verified offline recovery steps
in [the authentication guide](docs/authentication.md#recovery). The recovery command
uses temporary `RESET_OWNER_*` environment values, preserves the bound owner, and
revokes every existing session:

```bash
npm run auth:reset-owner-password -- --confirm-owner-password-reset
```

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

The active legacy app only publishes `NEXT_PUBLIC_SITE_URL`. The Firebase web app
identifiers in `.env.example` will also be public after cutover. Database,
authentication, Cloudinary, owner
bootstrap, and owner recovery credentials remain server-only. Remove temporary
password variables after their command succeeds. Next.js and the
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

## Firebase migration branch

The owner account is provisioned in Firebase Authentication. Set Firebase web
identifiers and `FIREBASE_OWNER_UID` in ignored `.env.local`; this branch already
contains local values for the provided project. Server access also needs a service
account. For local development, download its JSON from Firebase Console → Project
settings → Service accounts, store it **outside the repository**, and set
`GOOGLE_APPLICATION_CREDENTIALS` to its absolute path in `.env.local`. Do not send
or commit that JSON. Vercel will use server-only `FIREBASE_ADMIN_CLIENT_EMAIL` and
`FIREBASE_ADMIN_PRIVATE_KEY` when the deployment migration is ready.

`firestore.rules` denies direct browser access because all Firestore reads and
writes belong on the server. Do not deploy the rules or switch production traffic
until the new auth, repositories, and Porto V2 seed have passed verification.

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
  protection, session policy, password changes, tests, and offline recovery.
- [Media service](docs/media.md): owner-only library, upload limits, Cloudinary
  delivery, metadata, references, deletion retries, and test boundaries.
- [Public content queries](docs/content-queries.md): public DTOs, visibility rules,
  ordering, query functions, and the guarded development seed.
- [Owner CMS](docs/cms.md): content, media, settings/theme screens, draft/public
  lifecycle, validation, optimistic concurrency, and refresh behavior.
- [Deployment runbook](docs/deployment.md): Aiven, migrations, Cloudinary, Vercel
  environment scopes, Hostinger DNS, owner bootstrap, and production verification.
- [CLAUDE.md](CLAUDE.md): compatibility pointer to the canonical instructions.
