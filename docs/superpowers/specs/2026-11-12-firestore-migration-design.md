# Porto V2: Firestore migration design

Status: design for review; implementation pending. Date: 12 November 2026.

## Purpose and decisions

Replace Aiven PostgreSQL with Cloud Firestore Standard edition for the portfolio's editable content and CMS state. Replace Better Auth with Firebase Authentication for the single owner. Keep Next.js 16, React 19, TypeScript, Vercel, and Cloudinary. The current Aiven database contains development samples only; no SQL data import is required. Seed content will be rebuilt from the Porto V2 design handoff, not from the existing PostgreSQL development seed.

The change addresses Aiven Free's inactivity shutdown. It does not promise zero downtime or unlimited free usage. Firestore usage, indexes, authentication, and Cloudinary remain operational concerns. The Porto V2 visual implementation is a separate workstream; the persistence migration must preserve the existing public and CMS behavior until the new visual layer is implemented.

### Approaches considered

| Approach | Benefit | Cost / reason |
| --- | --- | --- |
| Aiven Developer PostgreSQL | Smallest code change; no inactivity shutdown | Monthly service charge; does not meet the chosen Firebase direction |
| Firestore via server-only Firebase Admin SDK, Firebase Auth, Cloudinary | Meets the chosen stack; keeps current server-rendered query and authorization boundaries | Rewrites SQL repositories, auth, transactions, tests, and operational docs |
| Direct browser access to Firestore | Fewer server data routes for a client-heavy app | Requires a new client security-rules/query model; weak fit for the current Next.js Server Component CMS |

Choose the second approach. Do not add Firestore reads or writes to public or admin client components. Browser Firebase use is limited to owner sign-in and password change. No Firebase Storage migration is included.

## Runtime architecture

`app/` pages and components continue to consume typed domain and presentation models from `lib/queries` and application services. A server-only Firebase Admin SDK client replaces `lib/database/connection.ts` and the Drizzle implementation behind `lib/repositories`. Route handlers and Server Actions continue to validate input, authorize owner operations, call services, then revalidate affected public cache tags and paths. Public routes, metadata, sitemap, and previews share the same publication filter.

The server Admin SDK bypasses Firestore Security Rules. Use a narrowly scoped service account/IAM identity, never expose its credentials to the browser, and deny browser Firestore access in rules. Authorization therefore remains mandatory at every server entry point, including reads. Development and tests use Firebase Auth and Firestore emulators with a separate project ID.

## Firestore document model

Use stable application IDs as document IDs. Store dates as timestamps where a complete date is known; preserve partial `YYYY` or `YYYY-MM` dates as validated strings. Keep server-side Zod validation and explicit DTO mapping. Do not serialize private draft fields in public models.

| Collection / document | Purpose |
| --- | --- |
| `site/settings`, `site/theme`, `profile/main`, `pages/{routeKey}` | Singleton copy, validated theme values, biography/education introduction, SEO and route copy |
| `projects/{id}`, `research/{id}`, `thoughts/{id}` | Editorial status, revision, published snapshot, optional draft snapshot, ordering and media IDs |
| `slugReservations/{kind_slug}` | Permanent ownership of published and historical slugs; reserved transactionally |
| `experiences/{id}`, `education/{id}`, `credentials/{id}`, `socialLinks/{id}` | Ordered profile records and verified links |
| `projectCategories/{id}`, `technologies/{id}` | Reusable taxonomy with stable IDs and keys |
| `mediaAssets/{id}`, `mediaReferences/{content_asset_role}`, `mediaDeletionJobs/{id}` | Cloudinary metadata, references, and durable deletion state |

The CMS data contract adds `projectPhase` (`planned`, `in_progress`, `completed`) separately from `publicationStatus` (`draft`, `published`, `archived`). `isFeatured` and `featuredOrder` are editorial settings, not evidence that a project is finished. Experiences may reference stable organization/client IDs for collaboration counts without counting the same entity twice.

For editorial documents, `published` is the last validated public snapshot and `draft` is the working snapshot. Editing a published item never changes the `published` snapshot. Publishing validates required copy, slug ownership, taxonomy IDs, public/ready media, and expected revision; then atomically updates the public snapshot, status, timestamps, slug reservation, and media references. Unpublish removes public visibility while retaining the working copy and slug reservation. Firestore transactions read all needed documents before writes and contain no Cloudinary calls. Apply limits to document and Markdown size so an article cannot exceed Firestore's document limit.

Keep relationships as small arrays of stable IDs or embedded display values when they belong to one editorial record. Do not perform unbounded collection scans for public pages. Define composite indexes for publication status plus ordering and common archive filters; paginate large archives. Store an explicit owner-facing preview path that requires owner authorization. Public queries return only published snapshots and ready public media.

For media deletion, every content mutation updates `mediaReferences` and the corresponding asset's reference count/state in the same transaction. A delete transaction rejects any referenced asset, marks an unreferenced asset as deleting, and creates a deletion job. The Cloudinary operation runs after commit; failure leaves a retryable job. A new reference is rejected once deletion starts. This replaces the SQL foreign-key safety net without allowing a race between attachment and deletion.

## Owner authentication

Provision exactly one Firebase Authentication owner outside normal app startup. Store the approved owner UID in server-only configuration. The login page uses Firebase email/password sign-in with browser persistence disabled, sends the ID token to a same-origin session endpoint, and clears browser auth state after a successful exchange. The endpoint checks CSRF/origin, recent authentication, and the configured UID before issuing a 12-hour `HttpOnly`, `Secure` in production, `SameSite=Lax` session cookie. Every private read and write verifies that cookie, checks revocation where appropriate, and compares the UID. Sign-out clears the cookie and revokes active owner sessions. Password change requires recent reauthentication; offline owner recovery remains an explicit CLI operation, not a public route.

The app exposes no sign-up UI or app sign-up endpoint. To preserve the existing no-public-registration requirement at the provider API as well, configure Firebase Authentication with Identity Platform to disable end-user account creation; provision the owner with the Admin SDK or console. If this setting is unavailable in the selected Firebase project, do not claim provider-level registration is disabled. UID authorization still prevents other Firebase accounts from accessing the CMS, but the project configuration must be resolved before production release.

## Porto V2 seed and assets

Create a versioned, idempotent Porto V2 seed manifest in this repository. Its sources are the `Porto V2` and `Porto CMS` Figma pages plus the local design handoff documents `detail-pages.md`, `credentials-inventory.md`, `thought-sample.md`, `design-system.md`, `design-tokens.md`, and `cms-design.md` from the Yogaa design workspace. Copy the approved content into the manifest; runtime and CI must not depend on those external local paths or Figma availability.

Seed the three featured projects in order: Sakode Academy, AISnet Mobile, and ReyyAid Top Up. Seed the verified Experience, Education, Credentials, contact links, section copy, and theme values from the Porto V2 handoff. Create the sample Thought as `draft` with no public publication timestamp. Research remains separate from professional Work. Populate only claims, dates, URLs, and media alt text supported by the handoff; leave uncertain fields empty/private. Compute completed-project and collaboration counts from records, not hard-coded snapshot numbers.

The repository currently has no approved Porto V2 image assets under `public/`. Import user-supplied portrait, logos, store artwork, and screenshots into Cloudinary through a controlled owner process, then record verified asset metadata and IDs before publishing records that require them. Do not seed machine-local paths or Figma preview URLs as production image URLs. The import must check for private information in AISnet and research screenshots. A seed run must refuse to overwrite existing non-seed production content unless an explicit, environment-specific reset is authorized.

## Migration sequence and verification

1. Add Firebase project configuration and emulator setup without connecting to production; update the architecture and environment templates. Never commit service-account secrets.
2. Implement Firebase Authentication/session/owner guard with emulator tests, then replace Better Auth routes and bootstrap/reset scripts. Preserve CMS read/write protection throughout.
3. Implement Firestore repositories and service transactions one domain at a time: site/profile, public content, editorial CMS, taxonomy and credentials, then media metadata/deletion. Keep domain models and UI call sites stable where possible.
4. Build and validate the Porto V2 content manifest and controlled asset import. Run the seed only against an explicitly selected Firebase project; verify counts, publication status, slug uniqueness, media references, and representative rendered pages.
5. Run TypeScript, ESLint, production build, and emulator-backed tests for owner denial, draft/public isolation, stale-write conflicts, publish/unpublish, slug reservation, private media, deletion retries, cache invalidation, metadata, and sitemap. Test the CMS at 390, 768, and 1440 px during the later visual implementation.
6. After parity is demonstrated, remove Drizzle, postgres.js, PGlite, Better Auth, SQL migrations, and Aiven environment variables/scripts. Update README and deployment runbook. Switch deployment configuration only after Firebase project, owner, Cloudinary, and seed are verified. Keep the former database untouched until the new deployment is confirmed.

No real Aiven data import is planned. No destructive action against the Aiven service is part of this design. The design is complete when each existing public/CMS flow can be expressed with Firestore, Firebase Auth, and Cloudinary, and the seed's claims and publication states match Porto V2.

## External references

- [Firestore pricing and free quota](https://firebase.google.com/docs/firestore/pricing)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Firebase Admin SDK server access](https://firebase.google.com/docs/firestore/client/libraries)
- [Firebase Authentication session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Identity Platform end-user signup controls](https://docs.cloud.google.com/identity-platform/docs/concepts-manage-users)
