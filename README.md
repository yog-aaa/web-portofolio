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

The local owner login is at `/admin/login`. Firestore is server-only; the browser uses Firebase only to sign in. Add `localhost` to Firebase Authentication authorized domains for Google sign-in. The CMS requires the configured owner UID even when another account can authenticate.

## Porto V2 content

Run the initial seed only for the intended Firebase project. It is idempotent: existing seed records are retained, and records created by another source are never overwritten. The seed uploads the 12 approved images to Cloudinary with content-hashed IDs and registers them in Firestore. It creates three featured projects, five experiences, education, 28 credentials, site/section copy, one public research summary, and a private draft thought.

```powershell
$env:CONFIRM_FIREBASE_PROJECT = 'your-project-id'
npm run data:seed
npm run data:verify
```

The CMS provides owner-only forms for projects, experience, education, credentials, thoughts, research, homepage copy, site identity, theme, and master data. Projects, thoughts, and research have separate draft, publish, and unpublish actions. Images can be selected from the Cloudinary media library without entering URLs. The theme form changes the live light and dark palette, with text/background contrast validation. The old 12-screen CMS preview remains a visual reference.

Public pages read published Firestore data at request time. A change to a published project or thought becomes public when the owner chooses **Publish**. Draft thoughts are not returned by public queries. The hero's two approved counts are editable in `site/settings`; they are not yet derived automatically from projects and collaborators.

## Security and deployment

`firestore.rules` denies all direct browser reads and writes. The Firebase Admin SDK bypasses rules and enforces the owner check in Next.js. A read-only browser SDK check confirmed that unauthenticated Firestore reads currently return `permission-denied`. Deploy the tracked rules when configuring a new Firebase database:

```bash
firebase deploy --only firestore:rules --project your-project-id
```

Set the variables in `.env.example` in Vercel. Use `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` there instead of a machine-local credentials path. Never commit a service-account key, Cloudinary API secret, or `.env.local`.

See [architecture](docs/architecture.md) and [Firestore CMS operations](docs/firestore-cms.md) for the live data model. Older V1 design and database documents under `docs/` are historical references and do not describe the running Porto V2 application.
