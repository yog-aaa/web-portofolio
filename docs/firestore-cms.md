# Firestore CMS operations

## Seed and verification

Use a project ID confirmation before the idempotent seed or verification command:

```powershell
$env:CONFIRM_FIREBASE_PROJECT = 'your-project-id'
npm run data:seed
npm run data:verify
```

`data:seed` creates only missing records. It checks the content hash of every already-registered approved asset and refuses to overwrite a record from a different source. Cloudinary public IDs include the content hash; uploads use `overwrite: false`. It does not read PostgreSQL or import SQL samples.

`data:verify` checks collection counts, published project media registration, slug uniqueness, the research record, and the sample Thought's private draft state. It is read-only. Keep `GOOGLE_APPLICATION_CREDENTIALS` outside the repo locally; use `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` for Vercel runtime.

## Editing

Open `/admin` after owner login. Choose a content type, select an entry, and edit its labelled fields. Search is available for larger lists. For Projects, Research, and Thoughts, **Save draft** changes only the draft; **Publish changes** validates and replaces the public snapshot. **Unpublish** hides the public snapshot while retaining the draft and slug reservation. A stale editor cannot overwrite a newer revision.

For images, upload in `/admin/media` with meaningful alt text. JPEG, PNG, and WebP files up to 3 MB are accepted. Return to a content form and select the image from its library picker; use **Refresh library** if the editor was already open. SVG brand assets from the approved seed are already registered. The Media page lists assets but does not delete referenced media. The thought form can insert a library image into the article body.

The Theme page edits the live background, text, and accent colors separately for light and dark mode. Text/background pairs must meet at least 4.5:1 contrast. The previous seeded swatches were aligned once to the existing public CSS colors before enabling this control.

## Firestore rules

The tracked `firestore.rules` file denies all browser access, including authenticated users. This is deliberate because all content and CMS access is mediated by Next.js server code. Firebase's Admin SDK bypasses the rules. Deploy only the rules with `firebase deploy --only firestore:rules --project your-project-id` when provisioning a new database. A direct unauthenticated Firebase Web SDK read should return `permission-denied`.

## Deployment

Set the Firebase web config, server project ID, owner UID, Cloudinary URL/folder, public site URL, and Firebase Admin email/private key in Vercel. The path in `GOOGLE_APPLICATION_CREDENTIALS` is for local development only. Deploy the rules and verify them before publishing a new environment. Seed against the intended project once, then run `data:verify` and review public pages plus the owner CMS.
