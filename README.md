# YOGAAA. Portfolio

Porto V2 is Yoga Agustiansyah's public portfolio and single-owner content studio. The public site uses Cream + Ink and Charcoal + Sand themes across desktop, tablet, and mobile.

## Current stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Firebase Authentication for the one CMS owner
- Cloud Firestore through the Firebase Admin SDK, only on the server
- Cloudinary for approved images and CMS uploads
- Vercel as the deployment target

PostgreSQL, Drizzle, and Better Auth are no longer part of the active application. No old SQL sample data was imported.

## Local setup

Use Node.js 24.12 or newer. Copy `.env.example` to `.env.local`, fill in the Firebase web config, project ID, owner UID, Cloudinary credentials, and the local `GOOGLE_APPLICATION_CREDENTIALS` path. Keep the service-account JSON outside the repo.

```bash
npm ci
npm run dev
```

The local owner login is at `/admin/login`. Firestore is server-only; the browser uses Firebase only to sign in. Add `localhost` and the production domain to Firebase Authentication authorized domains for Google sign-in. The CMS requires the configured owner UID even when another account can authenticate. To connect Google after an email/password login, open **Account access** in the CMS, confirm the current password, then choose the Google account with the same email. The browser's temporary Firebase session is cleared after linking; both sign-in methods keep the original owner UID.

## Porto V2 content

Run the initial seed only for the intended Firebase project. It is idempotent: existing seed records are retained, and records created by another source are never overwritten. The seed uploads the 13 approved images to Cloudinary with content-hashed IDs and registers them in Firestore. It creates three featured projects, five experiences, education, 28 credentials, site/section copy, one public research summary, and a private draft thought. The research preview is sourced from the Porto V2 Figma design and registered as Cloudinary media.

```powershell
$env:CONFIRM_FIREBASE_PROJECT = 'your-project-id'
npm run data:seed
npm run data:verify
```

The CMS provides owner-only forms for projects, experience, education, credentials, thoughts, research, homepage copy, site identity, theme, and master data. Projects, thoughts, and research have separate draft, publish, and unpublish actions. Images can be selected from the Cloudinary media library without entering URLs. The theme form changes the live light and dark palette, with text/background contrast validation. The old 12-screen CMS preview remains a visual reference.

The project form controls homepage featuring, feature order, display order, and project status. The public Work pages use the published project data for titles, descriptions, status, links, and counts. The **Settings** navigation item opens appearance controls; profile details and homepage copy live under **Homepage & profile**. New CMS entries cannot overwrite an existing record with the same address.

Public pages read published Firestore data at request time. A change to a published project or thought becomes public when the owner chooses **Publish**. Draft thoughts are not returned by public queries. The hero's two approved counts are editable in `site/settings`; they are not yet derived automatically from projects and collaborators.

## Landing page motion

On a first visit, a full-screen YOGAAA. cover waits for the server-rendered home sections, essential type, and the hero portrait to decode, with a six-second ceiling if an asset or data request stalls. The server reads Firestore content for the page; the cover uses an indeterminate progress line rather than a fake data-loading percentage. It parts from the center to reveal a staggered hero composition. Later visits in the same browser session skip the cover. CSS view timelines provide reversible scroll movement where supported; other browsers show the content in place. The mobile menu retains keyboard focus and Escape handling. `prefers-reduced-motion: reduce` skips the cover and keeps content visible without the reveal motion. No animation library is required.

The public motion layer adds a cinematic watermark, portrait and lighting reveal, a subtle ambient glow, scroll-linked section and artwork movement, and a reading-progress line on supported browsers. Desktop fine-pointer devices can tilt the hero portrait and featured artwork in response to the pointer; touch and reduced-motion devices keep those visuals still. Detail pages share the same editorial entry and scroll rhythm. Motion acts on decorative imagery and section entry; body text stays still while visitors read.

The [Figma parity audit](docs/figma-parity-audit-2026-11-13.md) records the route-by-route desktop, tablet, and mobile review, applied fixes, and remaining design differences.

## Security and deployment

`firestore.rules` denies all direct browser reads and writes. The Firebase Admin SDK bypasses rules and enforces the owner check in Next.js. A read-only browser SDK check confirmed that unauthenticated Firestore reads currently return `permission-denied`. Deploy the tracked rules when configuring a new Firebase database:

```bash
firebase deploy --only firestore:rules --project your-project-id
```

Set the variables in `.env.example` in Vercel. Use `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` there instead of a machine-local credentials path. Never commit a service-account key, Cloudinary API secret, or `.env.local`.

See [architecture](docs/architecture.md) and [Firestore CMS operations](docs/firestore-cms.md) for the live data model. Older V1 design and database documents under `docs/` are historical references and do not describe the running Porto V2 application.
