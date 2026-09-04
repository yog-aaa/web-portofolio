import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "../lib/database/schema";
import type { Database } from "../lib/database/connection";
import { createPublicContentQueries } from "../lib/queries/public-content";
import { developmentSeedIds, seedDevelopmentContent } from "../scripts/development/seed";

const ids = {
  publicMedia: "10000000-0000-4000-8000-000000000001",
  privateMedia: "10000000-0000-4000-8000-000000000002",
  project: "20000000-0000-4000-8000-000000000001",
  draftProject: "20000000-0000-4000-8000-000000000002",
  archivedProject: "20000000-0000-4000-8000-000000000003",
  research: "30000000-0000-4000-8000-000000000001",
  draftResearch: "30000000-0000-4000-8000-000000000002",
  thought: "40000000-0000-4000-8000-000000000001",
  draftThought: "40000000-0000-4000-8000-000000000002",
  experience: "50000000-0000-4000-8000-000000000001",
  hiddenExperience: "50000000-0000-4000-8000-000000000002",
  credential: "60000000-0000-4000-8000-000000000001",
  hiddenCredential: "60000000-0000-4000-8000-000000000002",
  category: "70000000-0000-4000-8000-000000000001",
  technology: "80000000-0000-4000-8000-000000000001",
} as const;

async function fixture() {
  const client = new PGlite();
  const directory = resolve(__dirname, "../drizzle");
  for (const file of (await readdir(directory)).filter((value) => value.endsWith(".sql")).sort()) {
    await client.exec(await readFile(resolve(directory, file), "utf8"));
  }
  const db = drizzle(client, { schema }) as unknown as Database;
  return { client, db, queries: createPublicContentQueries(db) };
}

async function seedQueryFixture(db: Database) {
  const publishedAt = new Date("2026-01-01T00:00:00.000Z");
  await db.insert(schema.profile).values({ id: 1, displayName: "Public Owner", focusLine: "Public focus",
    biographyMarkdown: "Public biography" }).onConflictDoNothing();
  await db.insert(schema.themeSettings).values({ id: 1, accent: "#526D82" });
  await db.insert(schema.mediaAssets).values([
    { id: ids.publicMedia, provider: "fixture", providerId: "public-image", category: "project", kind: "image",
      access: "public", availability: "ready", url: "https://example.test/public.jpg",
      secureUrl: "https://example.test/public.jpg", filename: "public.jpg", mimeType: "image/jpeg",
      format: "jpg", width: 1200, height: 800, bytes: 1000, altText: "Public cover" },
    { id: ids.privateMedia, provider: "fixture", providerId: "private-image", category: "profile", kind: "image",
      access: "private", availability: "ready", url: "https://example.test/private.jpg",
      secureUrl: "https://example.test/private.jpg", filename: "private.jpg", mimeType: "image/jpeg",
      format: "jpg", width: 400, height: 400, bytes: 500, altText: "Private image" },
  ]);
  await db.update(schema.profile).set({ portraitMediaId: ids.privateMedia }).where(eq(schema.profile.id, 1));
  await db.insert(schema.siteSettings).values({ id: 1, profileId: 1, themeSettingsId: 1, brandName: "Public Brand",
    siteTitle: "Public Site", heroHeadline: "Public headline", defaultSocialImageId: ids.privateMedia });
  await db.insert(schema.sitePageSettings).values({ route: "/work", siteSettingsId: 1,
    intro: "Public work introduction", emptyStateCopy: "Public empty state", socialImageId: ids.privateMedia });
  await db.insert(schema.education).values([
    { profileId: 1, institutionName: "Visible Institute", qualificationOrProgram: "Visible Program",
      isVisible: true, sortOrder: 0, institutionMediaId: ids.privateMedia, gpaValue: "3.5", gpaScale: "4" },
    { profileId: 1, institutionName: "Hidden Institute", qualificationOrProgram: "Hidden Program",
      isVisible: false, sortOrder: 1 },
  ]);
  await db.insert(schema.socialLinks).values([
    { profileId: 1, label: "Visible contact", destination: "mailto:visible@example.test", purpose: "contact", isVisible: true, sortOrder: 0 },
    { profileId: 1, label: "Private contact", destination: "mailto:private@example.test", purpose: "contact", isVisible: false, sortOrder: 1 },
  ]);

  await db.insert(schema.projects).values([
    { id: ids.project, title: "Published project", summary: "Published summary", roleOrContribution: "Published role",
      bodyMarkdown: "Published body", draftContent: { version: 1, title: "PRIVATE PROJECT DRAFT" },
      isFeatured: true, featuredOrder: 0, sortOrder: 0, publishedAt, publicUpdatedAt: publishedAt },
    { id: ids.draftProject, title: "PRIVATE DRAFT PROJECT", status: "draft", draftContent: { version: 1, title: "PRIVATE DRAFT PROJECT" } },
    { id: ids.archivedProject, title: "PRIVATE ARCHIVED PROJECT", status: "archived" },
  ]);
  await db.insert(schema.projectSlugs).values([
    { slug: "published-project", projectId: ids.project },
    { slug: "archived-project", projectId: ids.archivedProject },
  ]);
  await db.update(schema.projects).set({ slug: "published-project", status: "published" }).where(eq(schema.projects.id, ids.project));
  await db.update(schema.projects).set({ slug: "archived-project" }).where(eq(schema.projects.id, ids.archivedProject));

  await db.insert(schema.research).values([
    { id: ids.research, title: "Published research", summary: "Published research summary", researchType: "Study",
      roleOrContribution: "Research role", bodyMarkdown: "Published research body",
      draftContent: { version: 1, title: "PRIVATE RESEARCH DRAFT" }, isFeatured: true, featuredOrder: 0,
      sortOrder: 0, publishedAt, publicUpdatedAt: publishedAt },
    { id: ids.draftResearch, title: "PRIVATE DRAFT RESEARCH", status: "draft" },
  ]);
  await db.insert(schema.researchSlugs).values({ slug: "published-research", researchId: ids.research });
  await db.update(schema.research).set({ slug: "published-research", status: "published" }).where(eq(schema.research.id, ids.research));

  await db.insert(schema.thoughts).values([
    { id: ids.thought, title: "Published thought", excerpt: "Published excerpt",
      bodyMarkdown: "---\ncategory: Systems\n---\nPublished thought body",
      draftContent: { version: 1, title: "PRIVATE THOUGHT DRAFT" }, publishedAt, publicUpdatedAt: publishedAt },
    { id: ids.draftThought, title: "PRIVATE DRAFT THOUGHT", status: "draft" },
  ]);
  await db.insert(schema.thoughtSlugs).values({ slug: "published-thought", thoughtId: ids.thought });
  await db.update(schema.thoughts).set({ slug: "published-thought", status: "published" }).where(eq(schema.thoughts.id, ids.thought));

  await db.insert(schema.experiences).values([
    { id: ids.experience, profileId: 1, roleTitle: "Visible role", organizationName: "Visible organization",
      description: "Visible description", startDate: "2025", isVisible: true, sortOrder: 0 },
    { id: ids.hiddenExperience, profileId: 1, roleTitle: "PRIVATE ROLE", organizationName: "Private organization",
      description: "Private description", startDate: "2024", isVisible: false, sortOrder: 1 },
  ]);
  await db.insert(schema.credentials).values([
    { id: ids.credential, profileId: 1, title: "Visible credential", issuerName: "Visible issuer",
      credentialType: "Certificate", isVisible: true, sortOrder: 0 },
    { id: ids.hiddenCredential, profileId: 1, title: "PRIVATE CREDENTIAL", issuerName: "Private issuer",
      credentialType: "Certificate", isVisible: false, sortOrder: 1 },
  ]);
  await db.insert(schema.projectCategories).values({ id: ids.category, name: "Public category", key: "public-category", sortOrder: 0 });
  await db.insert(schema.technologies).values({ id: ids.technology, name: "Public technology", key: "public-technology", sortOrder: 0 });
  await db.insert(schema.projectCategoryAssignments).values({ projectId: ids.project, categoryId: ids.category, slot: "published" });
  await db.insert(schema.projectTechnologies).values({ projectId: ids.project, technologyId: ids.technology, slot: "published" });
  await db.insert(schema.researchTechnologies).values({ researchId: ids.research, technologyId: ids.technology, slot: "published" });
  await db.insert(schema.projectMedia).values([
    { projectId: ids.project, mediaAssetId: ids.publicMedia, slot: "published", role: "cover", sortOrder: 0, altText: "Context cover" },
    { projectId: ids.project, mediaAssetId: ids.privateMedia, slot: "draft", role: "gallery", sortOrder: 0 },
  ]);
  await db.insert(schema.researchMedia).values({ researchId: ids.research, mediaAssetId: ids.publicMedia,
    slot: "published", role: "cover", sortOrder: 0 });
  await db.insert(schema.thoughtMedia).values({ thoughtId: ids.thought, mediaAssetId: ids.publicMedia,
    slot: "published", role: "cover", sortOrder: 0 });
}

test("public queries expose only published, visible, public presentation data", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await seedQueryFixture(f.db);

  assert.equal((await f.queries.getSiteSettings())?.defaultSocialImage, null);
  assert.deepEqual(await f.queries.getPageSettings("/work"), { route: "/work",
    intro: "Public work introduction", emptyStateCopy: "Public empty state", seoTitle: null,
    seoDescription: null, socialImage: null });
  assert.equal((await f.queries.getThemeSettings())?.accent, "#526D82");
  const profile = await f.queries.getProfile();
  assert.equal(profile?.portrait, null);
  assert.deepEqual(profile?.education.map((item) => item.institutionName), ["Visible Institute"]);
  assert.equal(profile?.education[0].gpaValue, "3.500");
  assert.equal(profile?.education[0].gpaScale, "4.000");
  assert.deepEqual(profile?.socialLinks.map((item) => item.label), ["Visible contact"]);

  const projects = await f.queries.getPublishedProjects();
  assert.deepEqual(projects.map((item) => item.slug), ["published-project"]);
  assert.equal(projects[0].cover?.alt, "Context cover");
  assert.deepEqual(projects[0].categories, [{ key: "public-category", name: "Public category" }]);
  assert.deepEqual(projects[0].technologies, [{ key: "public-technology", name: "Public technology" }]);
  assert.deepEqual((await f.queries.getFeaturedProjects()).map((item) => item.id), [ids.project]);
  assert.equal((await f.queries.getProjectBySlug("published-project"))?.bodyMarkdown, "Published body");
  assert.equal(await f.queries.getProjectBySlug("archived-project"), null);
  assert.equal(await f.queries.getProjectBySlug("missing"), null);

  assert.deepEqual((await f.queries.getPublishedResearch()).map((item) => item.slug), ["published-research"]);
  assert.deepEqual((await f.queries.getFeaturedResearch()).map((item) => item.id), [ids.research]);
  assert.equal((await f.queries.getResearchBySlug("published-research"))?.bodyMarkdown, "Published research body");
  assert.deepEqual((await f.queries.getPublishedThoughts()).map((item) => item.slug), ["published-thought"]);
  assert.equal((await f.queries.getPublishedThoughts())[0].category, "Systems");
  assert.equal((await f.queries.getPublishedThoughts())[0].readingMinutes, 1);
  assert.deepEqual((await f.queries.getLatestThoughts(50)).map((item) => item.id), [ids.thought]);
  assert.equal((await f.queries.getThoughtBySlug("published-thought"))?.bodyMarkdown, "Published thought body");
  assert.deepEqual((await f.queries.getExperiences()).map((item) => item.roleTitle), ["Visible role"]);
  assert.deepEqual((await f.queries.getCredentials()).map((item) => item.title), ["Visible credential"]);

  const serialized = JSON.stringify(await Promise.all([
    f.queries.getPublishedProjects(), f.queries.getPublishedResearch(), f.queries.getPublishedThoughts(),
    f.queries.getExperiences(), f.queries.getCredentials(),
  ]));
  for (const forbidden of ["PRIVATE", "draftContent", "revision", '"status"', "private-image", "private@example.test"]) {
    assert.equal(serialized.includes(forbidden), false, `public result leaked ${forbidden}`);
  }
});

test("development seed is idempotent, preserves rows, and keeps incomplete research private", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  const first = await seedDevelopmentContent(f.db);
  const second = await seedDevelopmentContent(f.db);
  assert.deepEqual(first, { profile: "created", education: "created", research: "created" });
  assert.deepEqual(second, { profile: "preserved", education: "preserved", research: "preserved" });
  assert.equal((await f.db.select().from(schema.education).where(eq(schema.education.id, developmentSeedIds.education))).length, 1);
  const [research] = await f.db.select().from(schema.research).where(eq(schema.research.id, developmentSeedIds.research));
  assert.equal(research.status, "draft");
  const [settings] = await f.db.select().from(schema.siteSettings);
  assert.equal(settings.heroHeadline, "Building useful digital products with software & AI.");
  assert.equal((await f.queries.getFeaturedResearch()).length, 0);
  assert.equal((await f.db.select().from(schema.credentials)).length, 0);
  assert.equal((await f.db.select().from(schema.experiences)).length, 0);
  assert.equal((await f.db.select().from(schema.socialLinks)).length, 0);
});
