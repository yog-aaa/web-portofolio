# Porto V2 Figma parity audit — 13 November 2026

## Scope and method

Compared the running Next.js site on `localhost:3000` with the **Porto V2** frames in the Figma file `aG8C6QYnl92SnnUrJQFyIw`. Checked public pages and all twelve CMS design previews at desktop (1440 px), mobile (390 px), and dark tablet (768 px). The browser check covered route response, rendered heading, JavaScript page errors, and horizontal overflow. It was followed by a visual review of the captured pages and the relevant Figma frames. This is a design parity review, not a claim of pixel-perfect equivalence.

The real `/admin/*` CMS screens require the owner session. Their unauthenticated state was not used as evidence of their logged-in appearance. The `/preview/cms/*` routes are design references, not the operational editor.

## Public pages

| Route | Figma desktop / mobile | Result and remaining difference |
| --- | --- | --- |
| `/` | `17:1491`, `17:1492` / `55:1619` | Hero composition, theme pair, portrait, information hierarchy, and responsive arrangement follow the design. First-visit cover and center-parting reveal now follow motion frame `44:437`; loading state uses `44:413` and `44:425`. Some CMS copy and counts may change independently of Figma. |
| `/work` | `58:3287` / `61:4077` | Reworked featured Sakode panel, mobile image order, and project rows. The mobile card now keeps art and CTA together without a blank panel. |
| `/work/sakode-academy` | `59:3414` / `61:4124` | Case-study hierarchy, supplied screenshot, role metadata, and story sections render consistently. Text is live CMS content and can differ from the static design. |
| `/work/aisnet-mobile` | `59:3512` / `61:4162` | Same case-study system; uses the supplied store feature artwork and states Flutter/mobile contribution accurately. |
| `/work/reyyaid-top-up` | `59:3610` / `61:4200` | Same case-study system; uses the supplied project visual and frontend contribution. |
| `/experience` | `60:3709` / `62:4400` | Restored the compact editorial list, first-role emphasis, organization marks, and dates. Live entries and ordering remain CMS-driven. |
| `/about` | `60:3865` / `62:4452` | Adjusted intro, portrait position, Build/Lead/Learn rhythm, education, credential link, and closing CTA. Live biography may differ from Figma copy. |
| `/credentials` | `75:428` / `75:1106` | Reworked grouped category layout and mobile record order. The seed does not include every date/metadata detail shown in the Figma mockup; these should be added from verified credentials in CMS. |
| `/research` | `60:3936` / `62:4481` | Replaced the placeholder schematic with the actual Figma research interface preview, now registered in Cloudinary and Firestore. The image is a preview of the research, not a new research result. |
| `/research/privacy-preserving-fall-detection` | Research detail related to `60:3936` / `62:4481` | Detail route renders and fits all tested widths. Content comes from the published research record, so exact copy can differ from the Figma sample. |
| `/thoughts` | `60:4006` / `62:4509` | Editorial layout renders. It currently shows the designed empty state because the sample thought is a **draft**, which public queries must exclude. |
| `/thoughts/[slug]` | `65:8201` / `65:8089` | Design and route implementation exist. No published thought was available for a live browser comparison; publishing the draft solely for visual parity would change public content. |
| `/admin/login` | Owner access design | Login route renders without overflow. Authentication was not exercised in this visual pass. |

## CMS design previews

The following twelve `/preview/cms/[screen]` frames all returned HTTP 200 and fit desktop, mobile, and dark tablet widths: `overview`, `projects`, `project-editor`, `experience`, `education`, `research`, `thoughts`, `thought-editor`, `credentials`, `media`, `settings`, and `homepage`. Their visual counterparts are in Figma nodes `86:1155` through `87:3777`, with mobile reference set `87:3040` and following frames. The Projects preview now has working status filters, and its copy no longer implies that Firebase is unconnected.

**Outstanding parity gap:** the authenticated CMS still uses the functional record-list/editor layout in `components/admin/cms-collection-page.tsx`. The Figma module screens use a more tailored overview, table, and editor composition. The preview does not prove the operational CMS matches those frames. Bringing the live CMS to that exact design requires a separate authenticated screen-by-screen implementation and owner-session review.

## Motion and loading

- Server components fetch the published Firestore content. The cover waits until the core home sections are in the DOM, the display font is ready, and the hero portrait has decoded. A six-second ceiling prevents a stalled request or asset from trapping the visitor. Its progress line is intentionally indeterminate.
- The cover parts from the center and reveals the hero in a staged sequence. It appears once per browser session. A repeat visit and `prefers-reduced-motion: reduce` skip the cover.
- Scroll movement is reversible and CSS based where view timelines are supported. Core content remains visible when they are unavailable.

## Verification

- Desktop and mobile first-entry/repeat/reduced-motion checks passed.
- Public and CMS preview route checks: 24 routes at mobile, 24 at dark tablet, plus desktop capture checks; all checked responses were 200, with no page errors or horizontal overflow. One transient development-server navigation timeout was retried successfully.
- ESLint passed on the changed source. TypeScript `--noEmit --incremental false` passed. Production `next build` passed.
- The Cloudinary research preview loaded with HTTP 200 and nonzero image width.

The screenshot and route-check working artifacts were produced outside the repository in `porto-motion/page-audit/`. They are audit evidence, not production assets.
