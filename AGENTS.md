# Project

YOGAAA. — Personal Website of Yoga Agustiansyah.
A long-term personal digital hub, with planned domain https://yogaagustiansyah.my.id.

This is the canonical repository instruction file for Codex. Keep it concise;
put detailed decisions in `docs/`. `CLAUDE.md` is a compatibility pointer only.

# Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Geist, Geist Mono, npm
- PostgreSQL on Aiven, Drizzle ORM + Drizzle Kit, postgres.js
- Better Auth: email/password, single owner, no public registration
- Cloudinary: server-authorized uploads
- Vercel

These choices are locked unless an explicit future requirement changes them.
See `docs/architecture.md` for installed versus planned capabilities.

# Architecture Principles

- CMS-first and content-driven: routine content edits must eventually need no code change, Git commit, or redeployment.
- Use Server Components by default; isolate client-side interactivity.
- Public UI consumes domain/application data through queries and services, never direct SQL or arbitrary database rows.
- Enforce authentication, owner authorization, and validation server-side for every admin mutation; protect private reads too.
- Keep editable content out of scattered JSX; use safe Markdown for long-form content, without executable MDX or raw HTML.
- Use semantic design tokens; CMS theme controls must not accept arbitrary CSS or change layout/accessibility behavior.
- Never expose or log server credentials. Keep real values in `.env.local` locally and deployment environment settings remotely; track placeholders only in `.env.example`.

# Documentation

Before architectural work, read `docs/architecture.md`, the primary architecture contract.
Also read the relevant document when available:

- `docs/portfolio-prd.md`: product requirements, information architecture, scope
- `docs/design-system.md`: UI and design tokens
- `docs/database.md`: persistence, schema, migrations, owner provisioning
- `docs/deployment.md`: environment setup and deployment

The PRD and design system are available. The database and deployment documents
are planned; until created, follow the corresponding architecture and PRD sections.
Keep all specialized documents consistent with the architecture contract.

Before the final response for each task, check whether `README.md` needs updating.
Update it when changes affect project status, setup, commands, environment variables,
usage, or documentation links. Keep it accurate and concise; avoid unnecessary edits.

# Skills

Read the relevant skill's `SKILL.md` (or project-provided `*_SKILL.md`) before specialized work.
The current local skill root is `C:/Users/yogaa/.codex/skills/`:

- `to-prd/SKILL.md`: requirements, information architecture, scope
- `frontend-design/SKILL.md`: visual hierarchy, UX, layouts, responsiveness, interaction
- `tailwind-design-system/SKILL.md`: tokens, Tailwind architecture, component consistency
- `copywriting/SKILL.md`: user-facing copy and microcopy
- `ai-seo/SKILL.md`: SEO, semantic structure, metadata, discoverability

Apply skills within those responsibilities and the requested task scope. Generic
skill examples do not override the locked stack, identity, or architecture contract.

# Validation

After meaningful code changes, run the applicable checks using installed tools:

- TypeScript: `npm exec -- next typegen`, then `npm exec -- tsc --noEmit`
- ESLint: `npm run lint`
- Production build, when relevant: `npm run build`

For documentation-only changes, check consistency, references, environment safety,
and `git diff --check`. Report failures or checks not completed accurately.

# Content Accuracy

Never invent personal facts, achievements, metrics, GPA, credentials, or links.
Use explicit placeholders for unknown values; keep unfinished content unpublished.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
