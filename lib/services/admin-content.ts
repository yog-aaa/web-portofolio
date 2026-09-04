import "server-only";

import { and, eq, ne, sql } from "drizzle-orm";
import type { Database } from "../database/connection";
import { projects, projectSlugs, research, researchSlugs, thoughts, thoughtSlugs } from "../database/schema/editorial";
import { credentials, profile } from "../database/schema/site";
import { experiences, projectCategories, projectCategoryAssignments, projectMedia, projectTechnologies,
  researchMedia, researchTechnologies, technologies, thoughtMedia } from "../database/schema/relationships";
import type { ProjectDraft, ResearchDraft, ThoughtDraft } from "../domain/content-values";
import { parseThoughtDocument } from "../presentation/thought-document";
import { AdminContentRepository } from "../repositories/admin-content";
import type { OwnerPermission } from "../auth/authorization";
import type { z } from "zod";
import type { credentialInputSchema, experienceInputSchema, lifecycleInputSchema,
  projectInputSchema, researchInputSchema, thoughtInputSchema } from "../validation/admin-content";

type Authorize = (permission: OwnerPermission) => Promise<unknown>;
type ProjectInput = z.infer<typeof projectInputSchema>;
type ResearchInput = z.infer<typeof researchInputSchema>;
type ThoughtInput = z.infer<typeof thoughtInputSchema>;
type LifecycleInput = z.infer<typeof lifecycleInputSchema>;
type ExperienceInput = z.infer<typeof experienceInputSchema>;
type CredentialInput = z.infer<typeof credentialInputSchema>;
type EditorialDatabase = Parameters<Parameters<Database["transaction"]>[0]>[0];

const markdownMediaIds = (markdown: string | null) => [...new Set([...(markdown ?? "").matchAll(/(?:^|[^a-z0-9-])media:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?![a-z0-9-])/gi)]
  .map((match) => match[1].toLowerCase()))];

function thoughtMarkdown(category: string | null, markdown: string | null) {
  const body = parseThoughtDocument(markdown ?? "").bodyMarkdown;
  return category ? `---\ncategory: ${category}\n---\n\n${body}` : body || null;
}

async function requireProfile(db: Database) {
  const [row] = await db.select({ id: profile.id }).from(profile).where(eq(profile.id, 1));
  if (!row) throw new Error("CMS_PROFILE_REQUIRED");
}

async function reserveSlug(db: Database, type: "project" | "research" | "thought", slug: string, ownerId: string) {
  if (type === "project") {
    const [existing] = await db.select({ ownerId: projectSlugs.projectId }).from(projectSlugs).where(eq(projectSlugs.slug, slug));
    if (existing && existing.ownerId !== ownerId) throw new Error("CMS_SLUG_TAKEN");
    if (!existing) await db.insert(projectSlugs).values({ slug, projectId: ownerId });
  } else if (type === "research") {
    const [existing] = await db.select({ ownerId: researchSlugs.researchId }).from(researchSlugs).where(eq(researchSlugs.slug, slug));
    if (existing && existing.ownerId !== ownerId) throw new Error("CMS_SLUG_TAKEN");
    if (!existing) await db.insert(researchSlugs).values({ slug, researchId: ownerId });
  } else {
    const [existing] = await db.select({ ownerId: thoughtSlugs.thoughtId }).from(thoughtSlugs).where(eq(thoughtSlugs.slug, slug));
    if (existing && existing.ownerId !== ownerId) throw new Error("CMS_SLUG_TAKEN");
    if (!existing) await db.insert(thoughtSlugs).values({ slug, thoughtId: ownerId });
  }
}

async function replaceProjectRelations(db: Database, id: string, slot: "draft" | "published", input: ProjectInput) {
  await Promise.all([
    db.delete(projectCategoryAssignments).where(and(eq(projectCategoryAssignments.projectId, id), eq(projectCategoryAssignments.slot, slot))),
    db.delete(projectTechnologies).where(and(eq(projectTechnologies.projectId, id), eq(projectTechnologies.slot, slot))),
    db.delete(projectMedia).where(and(eq(projectMedia.projectId, id), eq(projectMedia.slot, slot))),
  ]);
  if (input.categoryIds.length) await db.insert(projectCategoryAssignments).values(input.categoryIds.map((categoryId) => ({ projectId: id, categoryId, slot })));
  if (input.technologyIds.length) await db.insert(projectTechnologies).values(input.technologyIds.map((technologyId) => ({ projectId: id, technologyId, slot })));
  const media = [
    ...(input.coverMediaId ? [{ projectId: id, mediaAssetId: input.coverMediaId, slot, role: "cover" as const, sortOrder: 0 }] : []),
    ...input.galleryMediaIds.map((mediaAssetId, sortOrder) => ({ projectId: id, mediaAssetId, slot, role: "gallery" as const, sortOrder })),
    ...markdownMediaIds(input.bodyMarkdown).map((mediaAssetId, sortOrder) => ({ projectId: id, mediaAssetId, slot, role: "body" as const, sortOrder })),
  ];
  if (media.length) await db.insert(projectMedia).values(media);
}

async function replaceResearchRelations(db: Database, id: string, slot: "draft" | "published", input: ResearchInput) {
  await Promise.all([
    db.delete(researchTechnologies).where(and(eq(researchTechnologies.researchId, id), eq(researchTechnologies.slot, slot))),
    db.delete(researchMedia).where(and(eq(researchMedia.researchId, id), eq(researchMedia.slot, slot))),
  ]);
  if (input.technologyIds.length) await db.insert(researchTechnologies).values(input.technologyIds.map((technologyId) => ({ researchId: id, technologyId, slot })));
  const media = [
    ...(input.coverMediaId ? [{ researchId: id, mediaAssetId: input.coverMediaId, slot, role: "cover" as const, sortOrder: 0 }] : []),
    ...input.figureMediaIds.map((mediaAssetId, sortOrder) => ({ researchId: id, mediaAssetId, slot, role: "figure" as const, sortOrder })),
    ...markdownMediaIds(input.bodyMarkdown).map((mediaAssetId, sortOrder) => ({ researchId: id, mediaAssetId, slot, role: "body" as const, sortOrder })),
  ];
  if (media.length) await db.insert(researchMedia).values(media);
}

async function replaceThoughtRelations(db: Database, id: string, slot: "draft" | "published", input: ThoughtInput) {
  await db.delete(thoughtMedia).where(and(eq(thoughtMedia.thoughtId, id), eq(thoughtMedia.slot, slot)));
  const media = [
    ...(input.coverMediaId ? [{ thoughtId: id, mediaAssetId: input.coverMediaId, slot, role: "cover" as const, sortOrder: 0 }] : []),
    ...markdownMediaIds(input.bodyMarkdown).map((mediaAssetId, sortOrder) => ({ thoughtId: id, mediaAssetId, slot, role: "body" as const, sortOrder })),
  ];
  if (media.length) await db.insert(thoughtMedia).values(media);
}

export class AdminContentService {
  constructor(private readonly db: Database, private readonly authorize: Authorize) {}

  private repository(db: Database = this.db) { return new AdminContentRepository(db); }
  private async read() { await this.authorize("cms:read"); }
  private async write() { await this.authorize("cms:write"); }

  async dashboard() { await this.read(); return this.repository().dashboard(); }
  async mediaOptions(category?: string) { await this.read(); return this.repository().mediaOptions(category); }
  async projects(id?: string) { await this.read(); const repository = this.repository(); const [items, taxonomy, media, selected] = await Promise.all([
    repository.listProjects(), repository.taxonomy(), repository.mediaOptions("project"), id ? repository.getProject(id) : null]); return { items, taxonomy, media, selected }; }
  async research(id?: string) { await this.read(); const repository = this.repository(); const [items, taxonomy, media, selected] = await Promise.all([
    repository.listResearch(), repository.taxonomy(), repository.mediaOptions("research"), id ? repository.getResearch(id) : null]); return { items, technologies: taxonomy.technologies, media, selected }; }
  async thoughts(id?: string) { await this.read(); const repository = this.repository(); const [items, media, selected] = await Promise.all([
    repository.listThoughts(), repository.mediaOptions("thought"), id ? repository.getThought(id) : null]); return { items, media, selected }; }
  async experiences(id?: string) { await this.read(); const repository = this.repository(); const [items, selected] = await Promise.all([
    repository.listExperiences(), id ? repository.getExperience(id) : null]); return { items, selected }; }
  async credentials(id?: string) { await this.read(); const repository = this.repository(); const [items, media, selected] = await Promise.all([
    repository.listCredentials(), repository.mediaOptions("credential"), id ? repository.getCredential(id) : null]); return { items, media, selected }; }

  async saveProject(input: ProjectInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      await requireProfile(tx);
      const repository = this.repository(tx);
      const mediaIds = [input.coverMediaId, ...input.galleryMediaIds, ...markdownMediaIds(input.bodyMarkdown)].filter((id): id is string => Boolean(id));
      await Promise.all([repository.assertTaxonomy(input.categoryIds, input.technologyIds), repository.assertMedia(mediaIds, input.intent === "publish")]);
      let row = input.id ? (await tx.select().from(projects).where(eq(projects.id, input.id)).for("update"))[0] : null;
      if (input.id && !row) throw new Error("CMS_NOT_FOUND");
      if (row && row.revision !== input.expectedRevision) throw new Error("CMS_STALE");
      if (row?.status === "archived") throw new Error("CMS_INVALID_STATE");
      const previous = row?.draftContent ?? (row ? {
        version: 1 as const, title: row.title, slug: row.slug, bodyMarkdown: row.bodyMarkdown,
        seoTitle: row.seoTitle, seoDescription: row.seoDescription, summary: row.summary,
        roleOrContribution: row.roleOrContribution, startDate: row.startDate, endDate: row.endDate,
        collaborators: row.collaborators, links: row.links, isFeatured: row.isFeatured,
        featuredOrder: row.featuredOrder, sortOrder: row.sortOrder,
      } : null);
      const draft: ProjectDraft = { ...previous, version: 1, title: input.title, slug: input.slug,
        summary: input.summary, roleOrContribution: input.roleOrContribution, startDate: input.startDate,
        endDate: input.endDate, bodyMarkdown: input.bodyMarkdown, seoTitle: input.seoTitle,
        seoDescription: input.seoDescription, links: input.links,
        isFeatured: input.isFeatured, featuredOrder: input.isFeatured ? input.featuredOrder : null, sortOrder: input.sortOrder };
      if (!row) {
        [row] = await tx.insert(projects).values({ title: input.title, draftContent: draft, sortOrder: input.sortOrder }).returning();
      }
      if (input.slug) await reserveSlug(tx, "project", input.slug, row.id);
      if (input.intent === "save") {
        await tx.update(projects).set({ draftContent: draft, revision: row.revision + 1, updatedAt: new Date() }).where(eq(projects.id, row.id));
        await replaceProjectRelations(tx, row.id, "draft", input);
      } else {
        const now = new Date();
        await tx.update(projects).set({ title: input.title, slug: input.slug, summary: input.summary,
          roleOrContribution: input.roleOrContribution, startDate: input.startDate, endDate: input.endDate,
          bodyMarkdown: input.bodyMarkdown, seoTitle: input.seoTitle, seoDescription: input.seoDescription,
          collaborators: draft.collaborators ?? [], links: input.links, isFeatured: input.isFeatured,
          featuredOrder: input.isFeatured ? input.featuredOrder : null, sortOrder: input.sortOrder,
          status: "published", draftContent: null, publishedAt: row.publishedAt ?? now,
          publicUpdatedAt: now, revision: row.revision + 1, updatedAt: now }).where(eq(projects.id, row.id));
        await replaceProjectRelations(tx, row.id, "published", input);
        await Promise.all([
          tx.delete(projectCategoryAssignments).where(and(eq(projectCategoryAssignments.projectId, row.id), eq(projectCategoryAssignments.slot, "draft"))),
          tx.delete(projectTechnologies).where(and(eq(projectTechnologies.projectId, row.id), eq(projectTechnologies.slot, "draft"))),
          tx.delete(projectMedia).where(and(eq(projectMedia.projectId, row.id), eq(projectMedia.slot, "draft"))),
        ]);
      }
      return { id: row.id, status: input.intent === "publish" ? "published" as const : "draft-saved" as const };
    });
  }

  async saveResearch(input: ResearchInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      await requireProfile(tx);
      const repository = this.repository(tx);
      const mediaIds = [input.coverMediaId, ...input.figureMediaIds, ...markdownMediaIds(input.bodyMarkdown)].filter((id): id is string => Boolean(id));
      await Promise.all([repository.assertTaxonomy([], input.technologyIds), repository.assertMedia(mediaIds, input.intent === "publish")]);
      let row = input.id ? (await tx.select().from(research).where(eq(research.id, input.id)).for("update"))[0] : null;
      if (input.id && !row) throw new Error("CMS_NOT_FOUND");
      if (row && row.revision !== input.expectedRevision) throw new Error("CMS_STALE");
      if (row?.status === "archived") throw new Error("CMS_INVALID_STATE");
      const previous = row?.draftContent ?? (row ? {
        version: 1 as const, title: row.title, slug: row.slug, bodyMarkdown: row.bodyMarkdown,
        seoTitle: row.seoTitle, seoDescription: row.seoDescription, summary: row.summary,
        researchType: row.researchType, researchStage: row.researchStage,
        roleOrContribution: row.roleOrContribution, researchDate: row.researchDate,
        academicPublishedDate: row.academicPublishedDate, institution: row.institution,
        venue: row.venue, citationText: row.citationText, doi: row.doi,
        collaborators: row.collaborators, links: row.links, isFeatured: row.isFeatured,
        featuredOrder: row.featuredOrder, sortOrder: row.sortOrder,
      } : null);
      const draft: ResearchDraft = { ...previous, version: 1, title: input.title, slug: input.slug,
        bodyMarkdown: input.bodyMarkdown, seoTitle: input.seoTitle, seoDescription: input.seoDescription,
        summary: input.summary, researchType: input.researchType, researchStage: input.researchStage,
        roleOrContribution: input.roleOrContribution, researchDate: input.researchDate,
        academicPublishedDate: input.academicPublishedDate, institution: input.institution,
        venue: input.venue, citationText: input.citationText, doi: input.doi, links: input.links,
        isFeatured: input.isFeatured, featuredOrder: input.isFeatured ? input.featuredOrder : null, sortOrder: input.sortOrder };
      if (!row) [row] = await tx.insert(research).values({ title: input.title, draftContent: draft, sortOrder: input.sortOrder }).returning();
      if (input.slug) await reserveSlug(tx, "research", input.slug, row.id);
      if (input.intent === "save") {
        await tx.update(research).set({ draftContent: draft, revision: row.revision + 1, updatedAt: new Date() }).where(eq(research.id, row.id));
        await replaceResearchRelations(tx, row.id, "draft", input);
      } else {
        const now = new Date();
        await tx.update(research).set({ title: input.title, slug: input.slug, bodyMarkdown: input.bodyMarkdown,
          seoTitle: input.seoTitle, seoDescription: input.seoDescription, summary: input.summary,
          researchType: input.researchType, researchStage: input.researchStage,
          roleOrContribution: input.roleOrContribution, researchDate: input.researchDate,
          academicPublishedDate: input.academicPublishedDate, institution: input.institution,
          venue: input.venue, citationText: input.citationText, doi: input.doi,
          collaborators: draft.collaborators ?? [], links: input.links, isFeatured: input.isFeatured,
          featuredOrder: input.isFeatured ? input.featuredOrder : null, sortOrder: input.sortOrder,
          status: "published", draftContent: null, publishedAt: row.publishedAt ?? now,
          publicUpdatedAt: now, revision: row.revision + 1, updatedAt: now }).where(eq(research.id, row.id));
        await replaceResearchRelations(tx, row.id, "published", input);
        await Promise.all([
          tx.delete(researchTechnologies).where(and(eq(researchTechnologies.researchId, row.id), eq(researchTechnologies.slot, "draft"))),
          tx.delete(researchMedia).where(and(eq(researchMedia.researchId, row.id), eq(researchMedia.slot, "draft"))),
        ]);
      }
      return { id: row.id, status: input.intent === "publish" ? "published" as const : "draft-saved" as const };
    });
  }

  async saveThought(input: ThoughtInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      await requireProfile(tx);
      const repository = this.repository(tx);
      const mediaIds = [input.coverMediaId, ...markdownMediaIds(input.bodyMarkdown)].filter((id): id is string => Boolean(id));
      await repository.assertMedia(mediaIds, input.intent === "publish");
      let row = input.id ? (await tx.select().from(thoughts).where(eq(thoughts.id, input.id)).for("update"))[0] : null;
      if (input.id && !row) throw new Error("CMS_NOT_FOUND");
      if (row && row.revision !== input.expectedRevision) throw new Error("CMS_STALE");
      if (row?.status === "archived") throw new Error("CMS_INVALID_STATE");
      const previous = row?.draftContent ?? (row ? { version: 1 as const, title: row.title, slug: row.slug,
        bodyMarkdown: row.bodyMarkdown, seoTitle: row.seoTitle, seoDescription: row.seoDescription,
        excerpt: row.excerpt, references: row.references } : null);
      const storedMarkdown = thoughtMarkdown(input.category, input.bodyMarkdown);
      const draft: ThoughtDraft = { ...previous, version: 1, title: input.title, slug: input.slug,
        bodyMarkdown: storedMarkdown, seoTitle: input.seoTitle, seoDescription: input.seoDescription,
        excerpt: input.excerpt, references: input.references };
      if (!row) [row] = await tx.insert(thoughts).values({ title: input.title, draftContent: draft }).returning();
      if (input.slug) await reserveSlug(tx, "thought", input.slug, row.id);
      if (input.intent === "save") {
        await tx.update(thoughts).set({ draftContent: draft, revision: row.revision + 1, updatedAt: new Date() }).where(eq(thoughts.id, row.id));
        await replaceThoughtRelations(tx, row.id, "draft", input);
      } else {
        const now = new Date();
        await tx.update(thoughts).set({ title: input.title, slug: input.slug, bodyMarkdown: storedMarkdown,
          seoTitle: input.seoTitle, seoDescription: input.seoDescription, excerpt: input.excerpt,
          references: input.references, status: "published", draftContent: null,
          publishedAt: row.publishedAt ?? now, publicUpdatedAt: now,
          revision: row.revision + 1, updatedAt: now }).where(eq(thoughts.id, row.id));
        await replaceThoughtRelations(tx, row.id, "published", input);
        await tx.delete(thoughtMedia).where(and(eq(thoughtMedia.thoughtId, row.id), eq(thoughtMedia.slot, "draft")));
      }
      return { id: row.id, status: input.intent === "publish" ? "published" as const : "draft-saved" as const };
    });
  }

  async lifecycle(input: LifecycleInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      const table = input.type === "project" ? projects : input.type === "research" ? research : thoughts;
      const [row] = await tx.select().from(table).where(eq(table.id, input.id)).for("update");
      if (!row) throw new Error("CMS_NOT_FOUND");
      if (row.revision !== input.expectedRevision) throw new Error("CMS_STALE");
      if ((input.operation === "feature" || input.operation === "unfeature") && input.type === "thought") throw new Error("CMS_INVALID_STATE");
      if ((input.operation === "feature" || input.operation === "unfeature") && row.status !== "published") throw new Error("CMS_INVALID_STATE");
      if (input.operation === "archive") {
        await tx.update(table).set({ status: "archived", ...(input.type === "thought" ? {} : { isFeatured: false, featuredOrder: null }),
          revision: row.revision + 1, updatedAt: new Date() }).where(eq(table.id, input.id));
      } else if (input.operation === "restore" || input.operation === "unpublish") {
        if (input.operation === "restore" && row.status !== "archived") throw new Error("CMS_INVALID_STATE");
        if (input.operation === "unpublish" && row.status !== "published") throw new Error("CMS_INVALID_STATE");
        await tx.update(table).set({ status: "draft", ...(input.type === "thought" ? {} : { isFeatured: false, featuredOrder: null }),
          revision: row.revision + 1, updatedAt: new Date() }).where(eq(table.id, input.id));
        await this.copyPublishedToDraft(tx, input.type, input.id);
      } else {
        const featured = input.operation === "feature";
        await tx.update(table).set({ isFeatured: featured, featuredOrder: featured ? 0 : null,
          publicUpdatedAt: new Date(), revision: row.revision + 1, updatedAt: new Date() } as never).where(eq(table.id, input.id));
      }
      return { id: input.id, operation: input.operation };
    });
  }

  private async copyPublishedToDraft(tx: EditorialDatabase, type: LifecycleInput["type"], id: string) {
    if (type === "project") {
      const [row] = await tx.select().from(projects).where(eq(projects.id, id));
      if (!row) throw new Error("CMS_NOT_FOUND");
      if (row.draftContent) return;
      await tx.update(projects).set({ draftContent: { version: 1, title: row.title, slug: row.slug,
        bodyMarkdown: row.bodyMarkdown, seoTitle: row.seoTitle, seoDescription: row.seoDescription,
        summary: row.summary, roleOrContribution: row.roleOrContribution, startDate: row.startDate,
        endDate: row.endDate, collaborators: row.collaborators, links: row.links,
        isFeatured: false, featuredOrder: null, sortOrder: row.sortOrder } }).where(eq(projects.id, id));
      const [cats, tech, media] = await Promise.all([
        tx.select().from(projectCategoryAssignments).where(and(eq(projectCategoryAssignments.projectId, id), eq(projectCategoryAssignments.slot, "published"))),
        tx.select().from(projectTechnologies).where(and(eq(projectTechnologies.projectId, id), eq(projectTechnologies.slot, "published"))),
        tx.select().from(projectMedia).where(and(eq(projectMedia.projectId, id), eq(projectMedia.slot, "published"))),
      ]);
      await Promise.all([
        tx.delete(projectCategoryAssignments).where(and(eq(projectCategoryAssignments.projectId, id), eq(projectCategoryAssignments.slot, "draft"))),
        tx.delete(projectTechnologies).where(and(eq(projectTechnologies.projectId, id), eq(projectTechnologies.slot, "draft"))),
        tx.delete(projectMedia).where(and(eq(projectMedia.projectId, id), eq(projectMedia.slot, "draft"))),
      ]);
      if (cats.length) await tx.insert(projectCategoryAssignments).values(cats.map(({ projectId, categoryId }) => ({ projectId, categoryId, slot: "draft" as const })));
      if (tech.length) await tx.insert(projectTechnologies).values(tech.map(({ projectId, technologyId }) => ({ projectId, technologyId, slot: "draft" as const })));
      if (media.length) await tx.insert(projectMedia).values(media.map(({ projectId, mediaAssetId, role, sortOrder, altText, caption, isDecorative }) => ({ projectId, mediaAssetId, slot: "draft" as const, role, sortOrder, altText, caption, isDecorative })));
    } else if (type === "research") {
      const [row] = await tx.select().from(research).where(eq(research.id, id));
      if (!row) throw new Error("CMS_NOT_FOUND");
      if (row.draftContent) return;
      await tx.update(research).set({ draftContent: { version: 1, title: row.title, slug: row.slug,
        bodyMarkdown: row.bodyMarkdown, seoTitle: row.seoTitle, seoDescription: row.seoDescription,
        summary: row.summary, researchType: row.researchType, researchStage: row.researchStage,
        roleOrContribution: row.roleOrContribution, researchDate: row.researchDate,
        academicPublishedDate: row.academicPublishedDate, institution: row.institution, venue: row.venue,
        citationText: row.citationText, doi: row.doi, collaborators: row.collaborators, links: row.links,
        isFeatured: false, featuredOrder: null, sortOrder: row.sortOrder } }).where(eq(research.id, id));
      const [tech, media] = await Promise.all([
        tx.select().from(researchTechnologies).where(and(eq(researchTechnologies.researchId, id), eq(researchTechnologies.slot, "published"))),
        tx.select().from(researchMedia).where(and(eq(researchMedia.researchId, id), eq(researchMedia.slot, "published"))),
      ]);
      await Promise.all([
        tx.delete(researchTechnologies).where(and(eq(researchTechnologies.researchId, id), eq(researchTechnologies.slot, "draft"))),
        tx.delete(researchMedia).where(and(eq(researchMedia.researchId, id), eq(researchMedia.slot, "draft"))),
      ]);
      if (tech.length) await tx.insert(researchTechnologies).values(tech.map(({ researchId, technologyId }) => ({ researchId, technologyId, slot: "draft" as const })));
      if (media.length) await tx.insert(researchMedia).values(media.map(({ researchId, mediaAssetId, role, sortOrder, altText, caption, isDecorative }) => ({ researchId, mediaAssetId, slot: "draft" as const, role, sortOrder, altText, caption, isDecorative })));
    } else {
      const [row] = await tx.select().from(thoughts).where(eq(thoughts.id, id));
      if (!row) throw new Error("CMS_NOT_FOUND");
      if (row.draftContent) return;
      await tx.update(thoughts).set({ draftContent: { version: 1, title: row.title,
        slug: row.slug, bodyMarkdown: row.bodyMarkdown, seoTitle: row.seoTitle,
        seoDescription: row.seoDescription, excerpt: row.excerpt, references: row.references } }).where(eq(thoughts.id, id));
      const media = await tx.select().from(thoughtMedia).where(and(eq(thoughtMedia.thoughtId, id), eq(thoughtMedia.slot, "published")));
      await tx.delete(thoughtMedia).where(and(eq(thoughtMedia.thoughtId, id), eq(thoughtMedia.slot, "draft")));
      if (media.length) await tx.insert(thoughtMedia).values(media.map(({ thoughtId, mediaAssetId, role, sortOrder, altText, caption, isDecorative }) => ({ thoughtId, mediaAssetId, slot: "draft" as const, role, sortOrder, altText, caption, isDecorative })));
    }
  }

  async saveExperience(input: ExperienceInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      await requireProfile(tx);
      const row = input.id ? (await tx.select().from(experiences).where(eq(experiences.id, input.id)).for("update"))[0] : null;
      if (input.id && !row) throw new Error("CMS_NOT_FOUND");
      if (row && row.updatedAt.toISOString() !== input.expectedUpdatedAt) throw new Error("CMS_STALE");
      if (input.isFeatured) await tx.update(experiences).set({ isFeatured: false, featuredOrder: null, updatedAt: new Date() })
        .where(input.id ? and(eq(experiences.isFeatured, true), ne(experiences.id, input.id)) : eq(experiences.isFeatured, true));
      const value = { profileId: 1, roleTitle: input.roleTitle, organizationName: input.organizationName,
        contextLabel: input.contextLabel, startDate: input.startDate!, endDate: input.isCurrent ? null : input.endDate,
        isCurrent: input.isCurrent, description: input.description, location: input.location,
        organizationUrl: input.organizationUrl, sortOrder: input.sortOrder, isVisible: input.isVisible,
        isFeatured: input.isFeatured, featuredOrder: input.isFeatured ? 0 : null, updatedAt: new Date() };
      const [saved] = row ? await tx.update(experiences).set(value).where(eq(experiences.id, row.id)).returning({ id: experiences.id })
        : await tx.insert(experiences).values(value).returning({ id: experiences.id });
      return saved;
    });
  }

  async saveCredential(input: CredentialInput) {
    await this.write();
    return this.db.transaction(async (tx) => {
      await requireProfile(tx);
      if (input.previewMediaId) await this.repository(tx).assertMedia([input.previewMediaId], input.isVisible);
      const row = input.id ? (await tx.select().from(credentials).where(eq(credentials.id, input.id)).for("update"))[0] : null;
      if (input.id && !row) throw new Error("CMS_NOT_FOUND");
      if (row && row.updatedAt.toISOString() !== input.expectedUpdatedAt) throw new Error("CMS_STALE");
      const value = { profileId: 1, title: input.title, issuerName: input.issuerName,
        credentialType: input.credentialType, issueDate: input.issueDate, expiryDate: input.expiryDate,
        publicIdentifier: input.publicIdentifier, description: input.description,
        verificationUrl: input.verificationUrl, previewMediaId: input.previewMediaId,
        sortOrder: input.sortOrder, isVisible: input.isVisible, updatedAt: new Date() };
      const [saved] = row ? await tx.update(credentials).set(value).where(eq(credentials.id, row.id)).returning({ id: credentials.id })
        : await tx.insert(credentials).values(value).returning({ id: credentials.id });
      return saved;
    });
  }

  async deleteCollection(type: "experience" | "credential", id: string, expectedUpdatedAt: string) {
    await this.write();
    return this.db.transaction(async (tx) => {
      const table = type === "experience" ? experiences : credentials;
      const [row] = await tx.select().from(table).where(eq(table.id, id)).for("update");
      if (!row) throw new Error("CMS_NOT_FOUND");
      if (row.updatedAt.toISOString() !== expectedUpdatedAt) throw new Error("CMS_STALE");
      await tx.delete(table).where(eq(table.id, id));
      return { id };
    });
  }

  async addTaxonomy(kind: "category" | "technology", name: string) {
    await this.write();
    const key = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!key || key.length > 80) throw new Error("CMS_TAXONOMY_INVALID");
    return this.db.transaction(async (tx) => {
      const table = kind === "category" ? projectCategories : technologies;
      const [existing] = await tx.select({ id: table.id }).from(table).where(eq(table.key, key)).for("update");
      if (existing) return existing;
      const [order] = await tx.select({ value: sql<number>`coalesce(max(${table.sortOrder}), -1) + 1` }).from(table);
      const [created] = await tx.insert(table).values({ name, key, sortOrder: Number(order.value) } as never).returning({ id: table.id });
      return created;
    });
  }
}

export function splitThoughtDraft(draft: ThoughtDraft) {
  const parsed = parseThoughtDocument(draft.bodyMarkdown ?? "");
  return { ...draft, category: parsed.category, bodyMarkdown: parsed.bodyMarkdown };
}
