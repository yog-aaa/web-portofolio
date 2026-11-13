# Porto V2 slicing handoff

Status: responsive UI slice on `feat/porto-v2-landing`, 13 November 2026. Visual source: the approved `Porto V2` and `Porto CMS` Figma frames. This is the front-end handoff before Firebase data binding.

## Public routes

| Route | Slice | Content source |
| --- | --- | --- |
| `/` | Hero, selected work, experience, learning, closing | Code-owned approved content |
| `/work` | Work index and project ledger | `components/porto-v2/detail-data.ts` |
| `/work/sakode-academy` | Frontend continuation case study | Same project record |
| `/work/aisnet-mobile` | UI design and Flutter case study; existing backend API | Same project record |
| `/work/reyyaid-top-up` | Puru frontend case study | Same project record |
| `/experience` | ITG, Puru, Sakode, AyaWarta, DIGITAK | Same experience records |
| `/about` | Profile, work approach, formal education, selected credentials | Approved static copy |
| `/credentials` | 28 records by type | Same credential groups |
| `/research` | Academic thesis introduction | Approved static copy |
| `/thoughts` | Editorial index | Draft preview in development; empty state in production |
| `/thoughts/the-interface-is-part-of-the-work` | Sample reading page | Development only; production returns 404 |

The research interface uses a CSS abstraction of the Figma preview. Source footage and on-screen metrics are omitted from public assets. No thesis results or metrics were invented in the text. The `research/[slug]` route returns 404 because no approved research detail page or publishable source exists. The draft Thought stays out of production even though its design can be reviewed locally.

The sitemap lists only the static V2 public pages and three approved case-study routes. It does not query the old database or expose draft routes. Dynamic sitemap generation will return with the Firebase published read models.

## Shared design and interactions

- `components/porto-v2/landing.css` owns Cream + Ink / Charcoal + Sand semantic tokens and shared header controls. `detail.css` extends those tokens for page layouts. The theme is stored in `localStorage` and follows the same ink transition as Home; reduced-motion users get an immediate switch.
- The public detail header links to route paths, with an accessible mobile menu. Desktop navigation appears at wide widths; tablet and mobile use the menu.
- Case studies share one data record and component for headings, metadata, visual, three content rows, and back navigation. Unknown slugs return 404.
- Responsive compositions were checked at 390, 768, and 1440 px. Case metadata changes from four columns to two; work rows and About content become editorial stacks, while article images remain in reading order.
- Supplied project visuals are used without replacing product claims. The About portrait uses the supplied cutout with its face, hair, and outfit unchanged.

## CMS design slice

The existing protected `/admin` workflows remain server-authorized and data-backed by the old PostgreSQL/Better Auth stack. The V2 shell is styled through `components/admin/cms-v2.css` and reuses the public palette and theme switch. The rail is 76 px compact, expands to 230 px, and keeps the active recess within the sidebar boundary. Tablet/mobile use a full-screen drawer; mobile has quick links to Overview, Projects, and Write. Overview and login have dedicated V2 compositions. Existing Projects, Experience, Research, Thoughts, Credentials, Media, Master Data, and Settings editors retain their behavior and receive the V2 token system.

`/admin/education` and `/admin/homepage` are reviewable visual slices of approved content. They do **not** save changes yet. This boundary is shown inside the owner UI. Education, Homepage/Profile, and the public pages will become editable when the approved Firebase Firestore/Auth migration is implemented. The current CMS theme settings form still stores V1 semantic theme values; it does not yet edit the V2 palette.

For design review without the old database or owner login, run the dev server and open `/preview/cms`. This development-only UI shows all 12 Figma CMS modules with the same rail, theme, responsive rules, search states, and representative content. It is explicitly read-only and returns 404 in production. The actual `/admin` routes stay protected and keep their existing authorization and save behavior.

## Validation and known boundaries

- `npm exec -- next typegen`, `npm exec -- tsc --noEmit`, `npm run lint`, and `npm run build` are required after code changes.
- Playwright checks public route availability, theme persistence, mobile navigation, missing images, and horizontal overflow at mobile/tablet/desktop widths. Screenshots are local test artifacts, not shipped assets.
- Live Firebase, CMS login, CMS mutations, and Cloudinary integration are outside this UI slice and require the separate integration phase. V2 public pages currently do not consume CMS records; published V1 records will not automatically appear on them.
- The displayed homepage project and collaboration numbers are the approved design snapshot and will need to derive from Firestore records when CMS binding is implemented.
