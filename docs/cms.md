# Owner CMS

The authenticated YOGAAA. CMS is a single-owner workspace at `/admin`. It covers
editorial content, credentials, media, site copy, contact details, and approved
theme colors. Authentication,
authorization, and database boundaries continue to follow
[architecture.md](architecture.md), [authentication.md](authentication.md), and
[database.md](database.md).

## Routes and workflow

| Route | Owner workflow |
| --- | --- |
| `/admin` | Content counts, workspace links, and password change |
| `/admin/projects` | Draft, preview, publish, archive, feature, categorize, attach technologies/covers/galleries, links, and SEO |
| `/admin/experience` | Create, edit, order, highlight, show/hide, and delete chronology entries |
| `/admin/research` | Draft, preview, publish, archive, feature, attach technologies/figures/resources, and SEO |
| `/admin/thoughts` | Draft, preview, publish, archive, category, cover, references, and SEO |
| `/admin/credentials` | Create, edit, order, show/hide, attach previews, verify, and delete credentials |
| `/admin/media` | Upload, browse, select, describe, inspect references, and safely delete Cloudinary assets |
| `/admin/master-data` | Create, edit, order, inspect usage, and safely delete reusable project categories and technologies |
| `/admin/settings` | Manage identity, homepage copy, location, contact email, social links, SEO default, and footer |
| `/admin/settings/theme` | Preview, save, and reset validated semantic color overrides |

Collection pages use a compact editorial list beside the active editor on wide
screens and a single flow on smaller screens. `?new=1` opens a blank editor;
`?edit=<application UUID>` opens an existing record. Invalid or unknown IDs never
become database queries or accidental new records. The shared protected layout,
route gate, and each application service boundary all verify the bound owner.

Forms use Server Actions. Each mutation authenticates and authorizes `cms:write`,
parses server-owned Zod schemas, and calls the application service. Client state is
used only for feedback and Markdown preview; hidden status or IDs never grant
permission. Validation returns a private, non-sensitive message. Successful writes
expire the affected public content tag and refresh the admin collection, public
archive/detail pattern, homepage, metadata, and sitemap dependencies.

Site and theme writes follow the same boundaries and reject stale forms. Site
settings replace the owner-managed visible contact/social list transactionally;
links are HTTPS-only and an explicit contact email becomes a `mailto:` contact
record. Theme writes accept only eight six-digit hex tokens and validate AA
contrast for primary text and accent-button text. Resetting stores null overrides
so the code-owned Calm Blue defaults remain authoritative. The public layout
receives the selected values during server rendering, avoiding a client theme flash.

## Editorial lifecycle

Projects, Research, and Thoughts use `draft`, `published`, and `archived`.

- **Save private draft** writes `draft_content` plus draft taxonomy/media slots.
  When a published item is edited, its current public columns remain unchanged.
- **Preview** runs the same safe Markdown component used publicly. Raw HTML,
  JavaScript, and MDX are not evaluated. Images resolve only through indexed
  `media:<application-uuid>` references.
- **Publish** validates complete public fields, reserved slug ownership, taxonomy,
  media readiness/access, and the expected revision. One transaction copies the
  draft into public columns and published relationship slots, retains the original
  publication time, updates the public modification time, and clears consumed draft
  slots.
- **Unpublish** removes the entry from public queries and creates a private working
  copy when one does not already exist. Pending private edits are preserved.
- **Archive** withdraws the entry while retaining content and historical slug
  ownership. **Restore draft** is the supported recovery path. Editorial hard delete
  is intentionally excluded because slugs remain reserved.
- **Feature** is available only to published Projects and Research. Experience has
  one visible homepage highlight.

Every editorial write checks the previously read integer revision inside a locked
transaction. Experience and Credential writes compare their previously read
`updated_at` value inside a locked transaction. A stale tab is refused rather than
silently replacing newer work.

## Inputs and media

Project categories and shared technologies can be added quickly from their relevant
collection page, then managed completely under `/admin/master-data`. Master data
uses stable lowercase keys, explicit ordering, and optimistic concurrency. Categories
support descriptions; technologies support optional HTTPS references and provider-neutral
icon keys. A referenced item cannot be deleted until it is removed from every draft
and published relationship. Slugs use lowercase kebab case. Partial
dates remain `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Structured link fields use one
`Label | https://example.com` entry per line. Thoughts store the optional category
in the documented strict Markdown frontmatter convention; the editor strips it
from the body field and recreates it safely.

Editors list only ready image assets from the provider-neutral media store. The
Media workspace uses the same abstraction for uploads, metadata, and deletion. Drafts
may reference ready private assets, but publication and visible Credentials reject
private media. Project galleries, Research figures, covers, and body Markdown media
are indexed through real foreign-key relationships. Uploading and deleting assets
continues through the authenticated MediaService API.

## Validation

`npm run test:admin` applies committed migrations to ephemeral PGlite and never
loads `.env.local`. It verifies denied reads/writes, draft/public isolation,
publication, stale-write rejection, withdrawal, private-media rejection, and
visible collection CRUD. Run it together with `npm run test:auth`, TypeScript,
ESLint, and the production build after CMS changes.

`npm run test:settings` covers owner authorization, initial singleton creation,
managed contact/social persistence, public delivery, stale-write refusal, theme
contrast, and reset behavior. `npm run test:media` also covers the library read
model and stale metadata editing.
