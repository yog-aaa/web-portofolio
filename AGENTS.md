# Project

YOGAAA. — Personal Website of Yoga Agustiansyah. This is the canonical repository instruction file. Keep detailed decisions in `docs/`.

# Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Firebase Authentication for one owner UID
- Cloud Firestore via Firebase Admin SDK, server-only
- Cloudinary for media, Vercel for deployment

Do not reintroduce PostgreSQL, Aiven, Drizzle, or Better Auth without an explicit new requirement. No SQL sample data needs migration.

# Architecture principles

- Public pages read published content from `lib/porto-v2/content.ts`. Never query Firestore from a browser component.
- Owner sign-in uses the Firebase browser SDK; every private read and mutation checks the server session and configured UID.
- CMS writes go through server actions with validation, revision checks, and publication controls. Keep draft content out of public queries.
- Approved images are registered in `mediaAssets` and delivered from Cloudinary. Never expose server credentials.
- Keep the Porto V2 visual system, responsive behavior, and reduced-motion support intact when changing content wiring.
- Real local credentials belong in `.env.local` and a service-account JSON outside the repo. Vercel uses environment variables.

# Documentation

Read `docs/architecture.md` and `docs/firestore-cms.md` before backend changes. `README.md` covers setup. Older V1 documents in `docs/` are historical references.

Before a final response, check whether `README.md` needs an update. Provide a Conventional Commit message when code changes are complete.
