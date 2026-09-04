import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../lib/database/schema";
import type { Database } from "../lib/database/connection";
import { createPublicContentQueries } from "../lib/queries/public-content";
import { AdminContentService } from "../lib/services/admin-content";
import { credentialInputSchema, experienceInputSchema, projectInputSchema,
  masterTaxonomyInputSchema, researchInputSchema, thoughtInputSchema } from "../lib/validation/admin-content";

const ids = {
  category: "10000000-0000-4000-8000-000000000001",
  technology: "20000000-0000-4000-8000-000000000001",
  publicMedia: "30000000-0000-4000-8000-000000000001",
  privateMedia: "30000000-0000-4000-8000-000000000002",
} as const;

async function fixture() {
  const client = new PGlite();
  const directory = resolve(__dirname, "../drizzle");
  for (const file of (await readdir(directory)).filter((value) => value.endsWith(".sql")).sort()) {
    await client.exec(await readFile(resolve(directory, file), "utf8"));
  }
  const db = drizzle(client, { schema }) as unknown as Database;
  await db.insert(schema.profile).values({ id: 1, displayName: "Test Owner" });
  await db.insert(schema.projectCategories).values({ id: ids.category, name: "Software", key: "software", sortOrder: 0 });
  await db.insert(schema.technologies).values({ id: ids.technology, name: "TypeScript", key: "typescript", sortOrder: 0 });
  await db.insert(schema.mediaAssets).values([
    { id: ids.publicMedia, provider: "fixture", providerId: "public", category: "project", kind: "image", access: "public", availability: "ready",
      secureUrl: "https://example.test/public.jpg", filename: "public.jpg", mimeType: "image/jpeg", width: 1200, height: 800, bytes: 100 },
    { id: ids.privateMedia, provider: "fixture", providerId: "private", category: "project", kind: "image", access: "private", availability: "ready",
      secureUrl: "https://example.test/private.jpg", filename: "private.jpg", mimeType: "image/jpeg", width: 1200, height: 800, bytes: 100 },
  ]);
  const permissions: string[] = [];
  const service = new AdminContentService(db, async (permission) => { permissions.push(permission); });
  return { client, db, service, permissions, publicQueries: createPublicContentQueries(db) };
}

function projectInput(overrides: Record<string, unknown> = {}) {
  return projectInputSchema.parse({ id: "", expectedRevision: 0, intent: "save", title: "Private project", slug: "private-project",
    summary: "A careful summary", roleOrContribution: "Owner contribution", startDate: "2026", endDate: "",
    bodyMarkdown: "## Overview\nPrivate working copy.", seoTitle: "", seoDescription: "", isFeatured: false,
    featuredOrder: null, sortOrder: 0, categoryIds: [ids.category], technologyIds: [ids.technology],
    coverMediaId: ids.publicMedia, galleryMediaIds: [], links: [], ...overrides });
}

test("admin service authorizes every boundary and preserves public/draft isolation", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());

  const denied = new AdminContentService(f.db, async () => { throw new Error("denied"); });
  await assert.rejects(denied.projects(), /denied/);
  await assert.rejects(denied.saveProject(projectInput()), /denied/);
  assert.equal((await f.db.select().from(schema.projects)).length, 0);

  const created = await f.service.saveProject(projectInput());
  assert.equal(created.status, "draft-saved");
  assert.equal(await f.publicQueries.getProjectBySlug("private-project"), null);
  assert.equal((await f.service.projects(created.id)).selected?.draft.title, "Private project");

  const published = await f.service.saveProject(projectInput({ id: created.id, expectedRevision: 1, intent: "publish" }));
  assert.equal(published.status, "published");
  assert.equal((await f.publicQueries.getProjectBySlug("private-project"))?.title, "Private project");

  await f.service.saveProject(projectInput({ id: created.id, expectedRevision: 2, title: "Unpublished edit" }));
  assert.equal((await f.publicQueries.getProjectBySlug("private-project"))?.title, "Private project");
  assert.equal((await f.service.projects(created.id)).selected?.draft.title, "Unpublished edit");
  await assert.rejects(f.service.saveProject(projectInput({ id: created.id, expectedRevision: 2, title: "Stale edit" })), /CMS_STALE/);

  await f.service.lifecycle({ type: "project", id: created.id, expectedRevision: 3, operation: "archive" });
  assert.equal(await f.publicQueries.getProjectBySlug("private-project"), null);
  assert.ok(f.permissions.includes("cms:read"));
  assert.ok(f.permissions.filter((permission) => permission === "cms:write").length >= 5);
});

test("publishing rejects private media and collection CRUD validates visibility", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  await assert.rejects(f.service.saveProject(projectInput({ intent: "publish", coverMediaId: ids.privateMedia })), /CMS_MEDIA_PRIVATE/);
  assert.equal((await f.db.select().from(schema.projects)).length, 0);

  const experience = await f.service.saveExperience(experienceInputSchema.parse({ id: "", expectedUpdatedAt: null,
    roleTitle: "Verified role", organizationName: "Verified organization", contextLabel: "Professional",
    startDate: "2025", endDate: "", isCurrent: true, description: "Verified description",
    location: "", organizationUrl: "", sortOrder: 0, isVisible: true, isFeatured: true }));
  assert.equal((await f.publicQueries.getExperiences())[0].id, experience.id);

  const credential = await f.service.saveCredential(credentialInputSchema.parse({ id: "", expectedUpdatedAt: null,
    title: "Verified credential", issuerName: "Verified issuer", credentialType: "Software", issueDate: "2026",
    expiryDate: "", publicIdentifier: "", description: "", verificationUrl: "", previewMediaId: "",
    sortOrder: 0, isVisible: true }));
  assert.equal((await f.publicQueries.getCredentials())[0].id, credential.id);
  const current = (await f.service.credentials(credential.id)).selected!;
  await f.service.deleteCollection("credential", credential.id, current.updatedAt.toISOString());
  assert.equal((await f.publicQueries.getCredentials()).length, 0);
  const taxonomy = await f.service.addTaxonomy("technology", "Computer Vision");
  assert.ok(taxonomy.id);
  let master = await f.service.masterData();
  const computerVision = master.technologies.find((item) => item.id === taxonomy.id)!;
  await f.service.saveTaxonomy(masterTaxonomyInputSchema.parse({ kind: "technology", id: computerVision.id,
    expectedUpdatedAt: computerVision.updatedAt.toISOString(), name: "Computer Vision", key: "computer-vision",
    description: "", referenceUrl: "https://example.test/computer-vision", iconKey: "computer-vision", sortOrder: 2 }));
  master = await f.service.masterData();
  const updated = master.technologies.find((item) => item.id === taxonomy.id)!;
  assert.equal(updated.referenceUrl, "https://example.test/computer-vision");
  await f.service.deleteTaxonomy("technology", updated.id, updated.updatedAt.toISOString());
  assert.equal((await f.service.masterData()).technologies.some((item) => item.id === taxonomy.id), false);
  await f.service.saveProject(projectInput());
  await assert.rejects(f.service.deleteTaxonomy("technology", ids.technology,
    (await f.service.masterData()).technologies.find((item) => item.id === ids.technology)!.updatedAt.toISOString()), /CMS_TAXONOMY_IN_USE/);
});

test("Research and Thoughts publish through private working copies", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  const researchDraft = researchInputSchema.parse({ id: "", expectedRevision: 0, intent: "save",
    title: "Measured research", slug: "measured-research", summary: "Research summary",
    researchType: "Study", researchStage: "Complete", roleOrContribution: "Research contribution",
    researchDate: "2026", academicPublishedDate: "", institution: "", venue: "", citationText: "", doi: "",
    bodyMarkdown: "## Methodology\nMeasured method.", seoTitle: "", seoDescription: "", isFeatured: false,
    featuredOrder: null, sortOrder: 0, technologyIds: [ids.technology], coverMediaId: "", figureMediaIds: [], links: [] });
  const research = await f.service.saveResearch(researchDraft);
  assert.equal(await f.publicQueries.getResearchBySlug("measured-research"), null);
  await f.service.saveResearch({ ...researchDraft, id: research.id, expectedRevision: 1, intent: "publish" });
  assert.equal((await f.publicQueries.getResearchBySlug("measured-research"))?.title, "Measured research");

  const thoughtDraft = thoughtInputSchema.parse({ id: "", expectedRevision: 0, intent: "save",
    title: "Careful thought", slug: "careful-thought", excerpt: "A concise excerpt", category: "Systems",
    bodyMarkdown: "# A safe heading\n\nA complete article.", seoTitle: "", seoDescription: "",
    coverMediaId: "", references: [] });
  const thought = await f.service.saveThought(thoughtDraft);
  await f.service.saveThought({ ...thoughtDraft, id: thought.id, expectedRevision: 1, intent: "publish" });
  const published = await f.publicQueries.getThoughtBySlug("careful-thought");
  assert.equal(published?.bodyMarkdown, "# A safe heading\n\nA complete article.");
  assert.equal(published?.category, "Systems");
  await f.service.lifecycle({ type: "thought", id: thought.id, expectedRevision: 2, operation: "archive" });
  assert.equal(await f.publicQueries.getThoughtBySlug("careful-thought"), null);
});

test("server validation rejects unsafe or incomplete publication input", () => {
  assert.equal(projectInputSchema.safeParse({ ...projectInput(), intent: "publish", summary: "", categoryIds: [] }).success, false);
  assert.equal(experienceInputSchema.safeParse({ id: "", expectedUpdatedAt: null, roleTitle: "Role", organizationName: "Org",
    contextLabel: "Professional", startDate: "2026", endDate: "2025", isCurrent: false,
    description: "Description", location: "", organizationUrl: "http://unsafe.test", sortOrder: 0,
    isVisible: true, isFeatured: false }).success, false);
});
