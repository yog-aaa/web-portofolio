# Porto V2 architecture

The public portfolio runs on Next.js App Router. Server Components call `lib/porto-v2/content.ts`, which reads Cloud Firestore using Firebase Admin SDK. Public queries filter editorial collections to `status == "published"` and render the `published` snapshot. A saved draft cannot change public content until the owner publishes it.

The owner signs in through Firebase Authentication, then exchanges an ID token for an HttpOnly session cookie at `/api/owner-session`. `lib/auth/require-owner.ts` verifies that cookie and compares its UID with `FIREBASE_OWNER_UID`. The middleware protects `/admin`; every server action repeats the owner check. Google and email/password may be linked to the same Firebase UID. The app has no public registration UI.

The active CMS pages use labelled forms in `components/admin/firestore-editor.tsx` and the server action in `app/admin/(protected)/cms-actions.ts`. The server validates submitted content with `lib/porto-v2/cms-schema.ts`. Editorial records keep `draft`, `published`, `status`, `revision`, and a permanent slug reservation. Writes use Firestore transactions and reject stale revisions. Changes call `revalidatePath`; public pages also read Firestore dynamically.

Cloudinary stores images. `mediaAssets` holds the public URL, public ID, asset ID, format, dimensions, and status. The CMS upload action validates type, size, image metadata, alt text, and owner access before upload. If Firestore registration fails, it removes the just-uploaded Cloudinary image. Existing approved assets are imported by the versioned seed script with deterministic IDs and `overwrite: false`.

Firestore Security Rules deny direct web and mobile SDK reads/writes. The Admin SDK bypasses those rules, so server route authorization is mandatory. No direct Firestore browser access is needed for public pages or the CMS.

## Collections

| Collection | Use |
| --- | --- |
| `site`, `profile`, `pages` | Identity, theme and section copy |
| `projects`, `research`, `thoughts` | Editorial drafts and published snapshots |
| `slugReservations` | Stable slug ownership |
| `experiences`, `education`, `credentials` | Profile records |
| `mediaAssets` | Cloudinary media registry |
| `projectCategories`, `technologies`, `socialLinks` | Optional CMS master data |

The initial seed deliberately excludes the old Aiven sample database. The three featured projects and the public research summary were rebuilt from approved Porto V2 material. The sample thought remains a private draft.

Current limits: the CMS forms are functional but do not reproduce every detail of the Figma CMS concept; the hero counts are editable values, not calculated from records; media removal/reference tracking is not yet exposed in the UI. The thought editor can insert a registered media-library image into its Markdown body.
