# Owner CMS

The authenticated YOGAAA. CMS is a single-owner workspace at `/admin`. It covers
Projects, Experience, Research, Thoughts, and Credentials. Profile/site/theme and
the full media-library screens remain separate planned surfaces. Authentication,
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

Collection pages use a compact editorial list beside the active editor on wide
screens and a single flow on smaller screens. `?new=1` opens a blank editor;
`?edit=<application UUID>` opens an existing record. Invalid or unknown IDs never
become database queries or accidental new records. The shared protected layout,
route gate, and each application service boundary all verify the bound owner.

Forms use Server Actions. Each mutation authenticates and authorizes `cms:write`,
parses server-owned Zod schemas, and calls the application service. Client state is
used only for feedback and Markdown preview; hidden status or IDs never grant
permission. Validation returns a private, non-sensitive message. Successful writes
refresh the affected admin collection, public archive/detail pattern, and homepage.

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

Project categories and shared technologies can be added from their relevant
collection page, then selected explicitly. Slugs use lowercase kebab case. Partial
dates remain `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Structured link fields use one
`Label | https://example.com` entry per line. Thoughts store the optional category
in the documented strict Markdown frontmatter convention; the editor strips it
from the body field and recreates it safely.

Editors list only ready image assets from the provider-neutral media store. Drafts
may reference ready private assets, but publication and visible Credentials reject
private media. Project galleries, Research figures, covers, and body Markdown media
are indexed through real foreign-key relationships. Uploading and deleting assets
continues through the authenticated MediaService API; a full `/admin/media` library
screen is outside this implementation.

## Validation

`npm run test:admin` applies committed migrations to ephemeral PGlite and never
loads `.env.local`. It verifies denied reads/writes, draft/public isolation,
publication, stale-write rejection, withdrawal, private-media rejection, and
visible collection CRUD. Run it together with `npm run test:auth`, TypeScript,
ESLint, and the production build after CMS changes.
