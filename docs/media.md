# Media service

The provider-neutral `MediaService` is the only application boundary for managed
media. `CloudinaryMediaService` coordinates authorization, validation, persistence,
and the server-only `CloudinaryGateway`. Public/domain UI imports neither the
Cloudinary SDK nor provider IDs. The full `/admin/media` library interface remains
future work.

## Upload contract

`POST /api/admin/media` accepts multipart form data only after a current Better Auth
session is confirmed as the bound owner and the request origin matches
`BETTER_AUTH_URL`. The accepted fields are `file`, `category`, `access`, `altText`,
`caption`, and `isDecorative`; duplicate or unknown fields fail closed.

Categories are `profile`, `project`, `research`, `thought`, `credential`, and
`social`. Access defaults to private. Public informative images require alt text;
decorative images must be marked explicitly. The allowlist is JPEG, PNG, and WebP.
Files are limited to 3 MiB, multipart requests to 4 MiB, dimensions to 8000 pixels
per side, and decoded area to 20 megapixels. Sharp fully decodes, orients, and
re-encodes the image, stripping metadata and rejecting animation, malformed input,
and files whose declared MIME type, extension, and decoded format disagree.

The server creates the UUID and provider path beneath
`CLOUDINARY_FOLDER_ROOT/<category>/<uuid>`. Callers cannot choose provider IDs,
folders, delivery types, overwrite behavior, or transformations. Private images
use Cloudinary's `authenticated` delivery type; public images use `upload`. Upload
metadata must match the authorized provider ID, access type, canonical versioned
URL, format, dimensions, and allowed provider byte count before the database row becomes
`ready`. Authorization is checked again after upload and before readiness.

An interrupted or ambiguous upload remains `pending` or `failed` and cannot be
attached as ready content. `POST /api/admin/media/[id]/reconcile` asks Cloudinary
for authoritative metadata and completes a tracked record only when every identity
check succeeds. It does not accept a provider ID or URL from the caller.

## Reads and delivery

`GET /api/admin/media/[id]` returns the provider-neutral asset plus known reference
counts to the owner. It verifies ready metadata with Cloudinary. Provider IDs and
private locators are omitted from DTOs.

Public queries may use `getPublicImage` only for `ready` and `public` records; their
parent repository must still enforce the parent's publication state. `next/image`
accepts only HTTPS `res.cloudinary.com` delivery for the configured cloud, the
`upload` type, and the configured folder/category/UUID shape. Query strings,
redirects, local addresses, SVG, other accounts, other folders, and authenticated
delivery are excluded from its optimizer allowlist.

Private DTOs point to `GET /api/admin/media/[id]/content`. That handler rechecks the
owner, generates a short-lived Cloudinary download URL on the server, fetches it
without redirects or caching, verifies the MIME type and byte limit, rechecks the
session, and returns the bytes with private/no-store, no-index, and nosniff headers.
The signed URL never reaches the browser. `MediaImage` disables public optimization
for this authenticated proxy path.

## Reference-safe deletion

`DELETE /api/admin/media/[id]` checks the owner and same origin, accepts only an
application UUID, verifies the record belongs to the configured Cloudinary namespace,
and refuses non-ready or referenced assets. Reference checks cover every current
media foreign key plus existing profile/editorial Markdown and draft JSON mentions.
Foreign-key restrictions remain the final structural guard.

For an unreferenced asset, one database transaction locks and removes the media row
and creates a `media_deletions` job. Only after that transaction commits does the
service call Cloudinary `destroy` with CDN invalidation. Provider failure returns
`202` with `status: pending`; retrying the same application ID resumes the durable
job. A successful or already-missing provider result removes the job. The service
never deletes an arbitrary provider ID and never reports deletion complete while
the provider call is uncertain.

Future content write services must continue to store structured image references
through foreign keys and index Markdown/body references in their slot-aware media
tables within the same transaction. The current scan protects existing text uses;
the transactional index is required to prevent a future concurrent text-only save
from creating an untracked reference during deletion.

## Environment and verification

The implementation reads only server-side `CLOUDINARY_URL` and
`CLOUDINARY_FOLDER_ROOT`. `NEXT_PUBLIC_*` Cloudinary credentials are forbidden.
Migration `0002_media_service.sql` adds the category constraint and durable deletion
table. Review and apply it deliberately using the database workflow; this task did
not run it against Aiven.

`npm run test:media` applies committed migrations to ephemeral PGlite, exercises
real Drizzle persistence and Sharp validation, and uses a mocked Cloudinary gateway.
It covers denied uploads, sanitization, metadata, public/private DTOs, rendering,
references, and deletion retries. These tests do not prove live Cloudinary account
permissions, delivery configuration, CDN invalidation timing, or Aiven deployment;
verify those in a non-production integration environment before release.
