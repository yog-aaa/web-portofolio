# Media service

The provider-neutral `MediaService` is the only application boundary for managed
media. `CloudinaryMediaService` coordinates authorization, validation, persistence,
and the server-only `CloudinaryGateway`. Public/domain UI imports neither the
Cloudinary SDK nor provider IDs. The owner library at `/admin/media` uses this
service for every read and mutation.

## Owner media library

The responsive media workspace uploads, filters, browses, selects, and previews
managed images. It displays category, access, readiness, dimensions, MIME type,
and byte size. Selecting an asset exposes its application UUID and current
reference summary; Cloudinary public IDs and signed private URLs never enter the
client DTO.

`GET /api/admin/media` returns the provider-neutral library. `PATCH
/api/admin/media/[id]` updates alt text, caption, and the decorative flag with a
previously read `updatedAt` value, refusing stale tabs. Public informative images
must retain alt text. Metadata requests are same-origin, JSON-only, size-bounded,
strictly validated, and owner-authorized. Changes invalidate the public layout
because asset-level alternatives may be used by public references.

## Upload contract

The production UI first calls `POST /api/admin/media/direct` with a small JSON
descriptor. After owner and same-origin checks, the server creates the application
UUID and a pending database record, then returns constrained signed parameters.
The browser sends file bytes directly to Cloudinary and calls the existing
reconciliation endpoint. This avoids Vercel Functions' 4.5 MB body limit while
keeping `CLOUDINARY_URL` and the API secret on the server.

Categories are `profile`, `project`, `research`, `thought`, `credential`, and
`social`. Access defaults to private. Public informative images require alt text;
decorative images must be marked explicitly. The allowlist is JPEG, PNG, and WebP.
Files are limited to 10 MiB, dimensions to 8000 pixels per side, and decoded area
to 20 megapixels. The signed request fixes the application-owned public ID,
delivery type, format, overwrite policy, and incoming orientation/profile-stripping
transformation. Cloudinary must decode the input as an image; reconciliation then
reads authoritative provider metadata and rejects format, dimension, pixel-area,
or byte-size violations. The legacy multipart parser remains bounded to 4 MiB and
is not used by the production UI.

The server creates the UUID and provider path beneath
`CLOUDINARY_FOLDER_ROOT/<category>/<uuid>`. Callers cannot choose provider IDs,
folders, delivery types, overwrite behavior, or transformations. Private images
use Cloudinary's `authenticated` delivery type; public images use `upload`. Upload
metadata must match the authorized provider ID, access type, canonical versioned
URL, format, dimensions, and allowed provider byte count before the database row becomes
`ready`. Authorization is checked again after upload and before readiness.

The Media Library and the primary portrait, project cover, research cover, Thought
cover, and credential preview fields use the same direct-upload helper. Every
successful upload is therefore a normal `media_assets` record: it immediately
appears in selectors and remains browsable, editable, reference-checked, and safely
deletable from `/admin/media`.

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
and refuses referenced ready assets. Incomplete unreferenced records can be discarded
after a provider deletion or confirmed not-found result. Reference checks cover every current
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
