# Deployment and launch runbook

This runbook covers the first production release of YOGAAA. to Vercel with Aiven
PostgreSQL, Cloudinary, Better Auth, and the Hostinger-managed domain
`yogaagustiansyah.my.id`. It is an operational checklist, not evidence that the
external services are already provisioned or verified. Follow the security and
migration boundaries in [architecture.md](architecture.md),
[database.md](database.md), [authentication.md](authentication.md), and
[media.md](media.md).

Never paste real credentials into source, documentation, issue comments, build
arguments, or logs. Local secrets belong in ignored `.env.local`; Vercel secrets
belong in the project Environment Variables settings. Use separate Aiven data and,
where practical, a separate Cloudinary folder for Preview so tests cannot modify
production content.

## 1. Environment contract

The tracked [.env.example](../.env.example) is the complete application contract.
`DATABASE_CA_CERT_BASE64` is required in addition to the core service URLs because
the application enforces Aiven certificate and hostname verification.

| Variable | Local development | Vercel Production | Classification |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://yogaagustiansyah.my.id` | Public, required |
| `DATABASE_URL` | Development Aiven database | Production Aiven database | Server-only secret, required |
| `DATABASE_CA_CERT_BASE64` | Base64 development Aiven CA | Base64 production Aiven CA | Server-only trust material, required |
| `BETTER_AUTH_SECRET` | Local high-entropy secret | Independent production secret, at least 32 characters | Server-only secret, required |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://yogaagustiansyah.my.id` | Server-side origin, required |
| `CLOUDINARY_URL` | Development/test Cloudinary account | Production Cloudinary account | Server-only secret, required |
| `CLOUDINARY_FOLDER_ROOT` | A development namespace | `yogaaa-portfolio` | Server-side configuration, required |
| `BOOTSTRAP_OWNER_NAME` | Only while provisioning | Only while provisioning | Bootstrap-only input |
| `BOOTSTRAP_OWNER_EMAIL` | Only while provisioning | Only while provisioning | Bootstrap-only private input |
| `BOOTSTRAP_OWNER_PASSWORD` | Only while provisioning | Remove immediately after success | Bootstrap-only secret |

Only `NEXT_PUBLIC_SITE_URL` is exposed to browser code. Never create public-prefixed
database, Better Auth, Cloudinary, CA, or bootstrap variables. Changes to Vercel
environment variables apply only to new deployments, so redeploy after changing a
runtime value. See Vercel's [environment variable documentation](https://vercel.com/docs/environment-variables).

For Preview deployments, use isolated service resources. If owner authentication
must be tested in Preview, configure `BETTER_AUTH_URL` to the exact stable Preview
origin being tested; the application deliberately trusts one origin. Keep
`NEXT_PUBLIC_SITE_URL` on the production canonical origin unless the Preview is a
deliberate staging site with its own indexing policy. Protect or noindex Preview
deployments before sharing them.

## 2. Provision Aiven PostgreSQL

1. Create or select the production Aiven for PostgreSQL service and record its
   service URI through a secure channel. Use a production database distinct from
   local development and Preview.
2. Download the service CA certificate (`ca.pem`) from Aiven. Aiven documents that
   `verify-full` requires CA material and verifies both the certificate and host;
   see [Aiven PostgreSQL connection guidance](https://aiven.io/docs/products/postgresql/howto/list-code-samples).
3. Set `DATABASE_URL` to the credentialed PostgreSQL URI with a database name and
   `sslmode=require`. The application normalizes the in-memory connection to
   `verify-full`; it does not weaken or rewrite the stored value.
4. Convert the certificate bytes to a single Base64 line without moving the file
   into the repository:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\ca.pem"))
   ```

5. Store the result as `DATABASE_CA_CERT_BASE64`. Do not use
   `NODE_TLS_REJECT_UNAUTHORIZED=0` or `rejectUnauthorized: false`.
6. Confirm service backups, restore access, PostgreSQL version, connection capacity,
   and the privileges of the migration and runtime users. The current runtime pool
   allows one connection per Vercel instance; Aiven capacity must account for
   concurrent instances.

## 3. Review and apply migrations

Migrations are deliberately excluded from Vercel build/start and application
startup. Before a production release:

1. Back up the intended database and rehearse the committed migrations against an
   isolated representative database.
2. Review `drizzle/0000_initial_schema.sql` through the latest committed migration,
   plus `drizzle/meta/_journal.json`. Run `npm run db:check` locally.
3. Verify the production target without printing its URL. Confirm that the database
   is empty or has an approved baseline plan; never apply the initial migration over
   unknown similarly named objects.
4. From a trusted operational environment with the production database variables
   securely injected, run:

   ```bash
   npm run db:migrate
   ```

5. Verify the Drizzle journal and expected tables. On failure, inspect the actual
   transaction state before retrying. Use a reviewed forward migration for fixes;
   never delete journal entries or drop production objects to force success.

## 4. Configure Cloudinary

1. Select the Cloudinary product environment intended for production and copy its
   credentialed `cloudinary://` URL into the server-only `CLOUDINARY_URL` variable.
2. Set `CLOUDINARY_FOLDER_ROOT=yogaaa-portfolio`. Use a different root for Preview
   if Preview shares the same Cloudinary account.
3. Do not create a public unsigned upload preset. The CMS obtains an owner-authorized,
   constrained signature and uploads browser bytes directly to Cloudinary; the API
   secret remains server-side. Cloudinary's authenticated upload contract is
   documented in [Upload API guidance](https://cloudinary.com/documentation/upload_images).
4. Confirm that the account permits image upload, metadata reads, authenticated
   delivery, deletion with invalidation, and public delivery from the configured
   namespace.

## 5. Configure Better Auth

Set an independent production `BETTER_AUTH_SECRET` of at least 32 high-entropy
characters and set `BETTER_AUTH_URL=https://yogaagustiansyah.my.id`. The URL must
match the browser origin exactly. Do not reuse the owner password, database password,
Cloudinary secret, or a local/Preview auth secret.

Public signup is disabled in the Better Auth server configuration. Authentication
uses the persisted Better Auth user/account/session tables and `owner_binding`; the
public Profile and contact email cannot grant CMS access.

## 6. Configure and deploy Vercel

1. Import the repository into Vercel or link it with the Vercel CLI. Keep npm and
   the repository's Node.js 22-or-newer engine. The build command is `npm run build`.
2. Add all required runtime variables from the table above to the Production scope.
   Add isolated values to Preview only when Preview integrations are intentionally
   exercised. Vercel supports certificate-sized environment values within its
   documented environment limits.
3. Do not add migrations, seeding, or owner bootstrap to the Vercel build command.
4. Create a Preview deployment first. Verify the public shell and inspect Vercel
   function/build logs for generic errors without logging secrets.
5. Create the production deployment through the production Git branch or the
   deliberate `vercel deploy --prod` workflow. Vercel's current CLI flow is
   documented in [Deploying a project from the CLI](https://vercel.com/docs/projects/deploy-from-cli).

Environment changes affect only later deployments. Redeploy after correcting any
URL, database, CA, auth, or Cloudinary variable.

## 7. Connect the Hostinger domain

1. In Vercel, open the project **Settings → Domains** and add
   `yogaagustiansyah.my.id`. Add `www.yogaagustiansyah.my.id` only if it will be
   redirected deliberately.
2. Copy the exact A, CNAME, or TXT verification records currently shown by Vercel.
   Do not rely on a copied historical IP: Vercel supplies project-specific DNS
   instructions for apex domains, subdomains, and ownership verification in its
   [custom-domain guide](https://vercel.com/docs/domains/working-with-domains/add-a-domain).
3. If the domain uses Hostinger nameservers, open hPanel **Domains → Domain
   portfolio → Manage → DNS / Nameservers → DNS records**. Hostinger documents this
   flow in [Manage DNS records](https://support.hostinger.com/en/articles/1583249-how-to-manage-dns-records-at-hostinger).
4. Replace only records that conflict with Vercel's required apex/`www` targets.
   Preserve MX, SPF, DKIM, DMARC, and unrelated subdomain records. If nameservers
   point elsewhere, edit DNS at that provider instead of Hostinger.
5. Enter the record name without duplicating the domain suffix, save it, and allow
   for DNS propagation. Hostinger notes propagation can take up to 24 hours.

## 8. Verify the custom domain

Wait until Vercel reports the domain configuration and SSL certificate as valid.
Then verify both HTTPS and the chosen `www` behavior, canonical metadata,
`/robots.txt`, and `/sitemap.xml`. Confirm that production responses do not redirect
to a Preview or `vercel.app` origin and that `BETTER_AUTH_URL` matches the final
HTTPS domain.

## 9. Provision the owner once

Apply all migrations first. In a trusted terminal with production database/auth
variables and temporary `BOOTSTRAP_OWNER_*` values securely injected, run:

```bash
npm run auth:bootstrap-owner
```

The command is serialized and idempotent. It refuses conflicting users or owner
bindings, creates credentials through Better Auth, and never prints the password.
Do not expose it as an HTTP route or run it during build/start.

After a successful bootstrap:

1. Remove `BOOTSTRAP_OWNER_PASSWORD` from Vercel, `.env.local`, and any temporary
   process/secret-manager scope. Remove the other bootstrap values when no longer
   needed.
2. Redeploy if a bootstrap value was present in Vercel so the next deployment no
   longer contains it.
3. Sign in and change the temporary password from `/admin`.

## 10. Release verification

Run the repository checks before deployment:

```bash
npm exec -- next typegen
npm exec -- tsc --noEmit
npm run lint
npm run build
npm run db:check
npm run test:database
npm run test:auth
npm run test:media
npm run test:content
npm run test:admin
npm run test:settings
npm run test:ui
```

After deployment, perform these checks against the production domain using
owner-approved content:

- Public: `/`, `/work`, one published `/work/[slug]`, `/experience`, `/research`,
  one published `/research/[slug]`, `/thoughts`, one published
  `/thoughts/[slug]`, `/about`, and `/credentials` return the intended public state.
- Authentication: an anonymous `/admin` request reaches login; a wrong password
  fails generically; public sign-up is rejected; the provisioned owner can sign in,
  retain a session, sign out, and cannot reuse the revoked session.
- CMS: create or edit a private project draft, preview it, publish it, and confirm
  its archive/detail/home dependencies update without a source edit or redeploy.
- Media: upload a permitted image up to 10 MiB, confirm it appears in Media Library,
  attach it, render it through `next/image`, inspect authoritative metadata, and
  verify referenced deletion is blocked. Remove an unused test asset safely.
- Theme: change a valid Calm Blue accent token, save, and confirm the public
  server-rendered CSS variables change without flash or redeploy; then restore the
  approved value.
- Discovery: canonical URLs, Open Graph data, JSON-LD, robots, and sitemap contain
  public production URLs and exclude withdrawn/draft/admin records.
- Accessibility: complete navigation/login/edit/publish/logout with a keyboard;
  inspect focus, headings, landmarks, form errors, table scrolling, alternatives,
  zoom/reflow, and reduced motion.

## 11. Launch gates and known operational limits

Production launch remains blocked until the external checks above pass. Automated
tests use ephemeral PostgreSQL and a mocked Cloudinary boundary; they do not prove
live Aiven connectivity, Cloudinary account permissions, Vercel ingress behavior,
DNS, SSL, cache propagation, or CDN invalidation. The application has no email
password-reset flow, so an owner-verified offline recovery procedure must be agreed
and rehearsed before launch.

Keep an Aiven restore path and a rollback-capable Vercel deployment available.
Schema rollback should normally use a reviewed forward migration. Content changes
can be corrected through the CMS; provider or cache failures need the retry paths
documented in the media and architecture guides.
