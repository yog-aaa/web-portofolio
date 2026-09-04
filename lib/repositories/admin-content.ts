import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../database/connection";
import { projects, research, thoughts } from "../database/schema/editorial";
import { mediaAssets } from "../database/schema/media";
import { credentials, profile } from "../database/schema/site";
import { experiences, projectCategories, projectCategoryAssignments, projectMedia,
  projectTechnologies, researchMedia, researchTechnologies, technologies, thoughtMedia } from "../database/schema/relationships";
import type { ProjectDraft, ResearchDraft, ThoughtDraft } from "../domain/content-values";

export type AdminEditorialStatus = "draft" | "published" | "archived";
export type AdminMediaOption = { id: string; filename: string; category: string | null; access: "public" | "private"; width: number | null; height: number | null };
export type AdminTaxonomyOption = { id: string; name: string; key: string };
export type AdminTaxonomyRecord = AdminTaxonomyOption & {
  kind: "category" | "technology";
  description: string | null;
  referenceUrl: string | null;
  iconKey: string | null;
  sortOrder: number;
  updatedAt: Date;
  projectCount: number;
  researchCount: number;
};
export type AdminMediaSelection = { id: string; role: "cover" | "gallery" | "figure" | "body" | "social"; sortOrder: number };

export type AdminProject = {
  id: string; status: AdminEditorialStatus; revision: number; updatedAt: string; publishedAt: string | null;
  publicSlug: string | null; isFeatured: boolean; draft: ProjectDraft; categoryIds: string[]; technologyIds: string[]; media: AdminMediaSelection[];
};
export type AdminResearch = {
  id: string; status: AdminEditorialStatus; revision: number; updatedAt: string; publishedAt: string | null;
  publicSlug: string | null; isFeatured: boolean; draft: ResearchDraft; technologyIds: string[]; media: AdminMediaSelection[];
};
export type AdminThought = {
  id: string; status: AdminEditorialStatus; revision: number; updatedAt: string; publishedAt: string | null;
  publicSlug: string | null; draft: ThoughtDraft; media: AdminMediaSelection[];
};
export type AdminExperience = typeof experiences.$inferSelect;
export type AdminCredential = typeof credentials.$inferSelect;

const iso = (value: Date | null) => value?.toISOString() ?? null;
const projectPublicDraft = (row: typeof projects.$inferSelect): ProjectDraft => ({
  version: 1, title: row.title, slug: row.slug, bodyMarkdown: row.bodyMarkdown,
  seoTitle: row.seoTitle, seoDescription: row.seoDescription, summary: row.summary,
  roleOrContribution: row.roleOrContribution, startDate: row.startDate, endDate: row.endDate,
  collaborators: row.collaborators, links: row.links, isFeatured: row.isFeatured,
  featuredOrder: row.featuredOrder, sortOrder: row.sortOrder,
});
const researchPublicDraft = (row: typeof research.$inferSelect): ResearchDraft => ({
  version: 1, title: row.title, slug: row.slug, bodyMarkdown: row.bodyMarkdown,
  seoTitle: row.seoTitle, seoDescription: row.seoDescription, summary: row.summary,
  researchType: row.researchType, researchStage: row.researchStage,
  roleOrContribution: row.roleOrContribution, researchDate: row.researchDate,
  academicPublishedDate: row.academicPublishedDate, institution: row.institution,
  venue: row.venue, citationText: row.citationText, doi: row.doi,
  collaborators: row.collaborators, links: row.links, isFeatured: row.isFeatured,
  featuredOrder: row.featuredOrder, sortOrder: row.sortOrder,
});
const thoughtPublicDraft = (row: typeof thoughts.$inferSelect): ThoughtDraft => ({
  version: 1, title: row.title, slug: row.slug, bodyMarkdown: row.bodyMarkdown,
  seoTitle: row.seoTitle, seoDescription: row.seoDescription,
  excerpt: row.excerpt, references: row.references,
});

export class AdminContentRepository {
  constructor(readonly db: Database) {}

  async hasProfile() {
    return Boolean((await this.db.select({ id: profile.id }).from(profile).where(eq(profile.id, 1)))[0]);
  }

  async dashboard() {
    const [projectRows, researchRows, thoughtRows, experienceRows, credentialRows] = await Promise.all([
      this.db.select({ status: projects.status }).from(projects),
      this.db.select({ status: research.status }).from(research),
      this.db.select({ status: thoughts.status }).from(thoughts),
      this.db.select({ visible: experiences.isVisible }).from(experiences),
      this.db.select({ visible: credentials.isVisible }).from(credentials),
    ]);
    const editorial = (rows: { status: AdminEditorialStatus }[]) => ({ total: rows.length,
      draft: rows.filter((row) => row.status === "draft").length,
      published: rows.filter((row) => row.status === "published").length,
      archived: rows.filter((row) => row.status === "archived").length });
    return { projects: editorial(projectRows), research: editorial(researchRows), thoughts: editorial(thoughtRows),
      experience: { total: experienceRows.length, visible: experienceRows.filter((row) => row.visible).length },
      credentials: { total: credentialRows.length, visible: credentialRows.filter((row) => row.visible).length } };
  }

  async taxonomy() {
    const [categories, technologyRows] = await Promise.all([
      this.db.select({ id: projectCategories.id, name: projectCategories.name, key: projectCategories.key })
        .from(projectCategories).orderBy(asc(projectCategories.sortOrder), asc(projectCategories.name)),
      this.db.select({ id: technologies.id, name: technologies.name, key: technologies.key })
        .from(technologies).orderBy(asc(technologies.sortOrder), asc(technologies.name)),
    ]);
    return { categories, technologies: technologyRows };
  }

  async taxonomyMaster(): Promise<{ categories: AdminTaxonomyRecord[]; technologies: AdminTaxonomyRecord[] }> {
    const [categoryRows, technologyRows, categoryUsage, projectTechnologyUsage, researchTechnologyUsage] = await Promise.all([
      this.db.select().from(projectCategories).orderBy(asc(projectCategories.sortOrder), asc(projectCategories.name)),
      this.db.select().from(technologies).orderBy(asc(technologies.sortOrder), asc(technologies.name)),
      this.db.select({ id: projectCategoryAssignments.categoryId,
        count: sql<number>`count(distinct ${projectCategoryAssignments.projectId})::int` })
        .from(projectCategoryAssignments).groupBy(projectCategoryAssignments.categoryId),
      this.db.select({ id: projectTechnologies.technologyId,
        count: sql<number>`count(distinct ${projectTechnologies.projectId})::int` })
        .from(projectTechnologies).groupBy(projectTechnologies.technologyId),
      this.db.select({ id: researchTechnologies.technologyId,
        count: sql<number>`count(distinct ${researchTechnologies.researchId})::int` })
        .from(researchTechnologies).groupBy(researchTechnologies.technologyId),
    ]);
    const counts = (rows: { id: string; count: number }[]) => new Map(rows.map((row) => [row.id, Number(row.count)]));
    const categoryProjectCounts = counts(categoryUsage);
    const technologyProjectCounts = counts(projectTechnologyUsage);
    const technologyResearchCounts = counts(researchTechnologyUsage);
    return {
      categories: categoryRows.map((row) => ({ ...row, kind: "category" as const,
        referenceUrl: null, iconKey: null, projectCount: categoryProjectCounts.get(row.id) ?? 0, researchCount: 0 })),
      technologies: technologyRows.map((row) => ({ ...row, kind: "technology" as const,
        description: null, projectCount: technologyProjectCounts.get(row.id) ?? 0,
        researchCount: technologyResearchCounts.get(row.id) ?? 0 })),
    };
  }

  async mediaOptions(category?: string): Promise<AdminMediaOption[]> {
    const rows = await this.db.select({ id: mediaAssets.id, filename: mediaAssets.filename,
      category: mediaAssets.category, access: mediaAssets.access, width: mediaAssets.width, height: mediaAssets.height })
      .from(mediaAssets).where(and(eq(mediaAssets.availability, "ready"), eq(mediaAssets.kind, "image")))
      .orderBy(desc(mediaAssets.createdAt), asc(mediaAssets.id));
    return category ? rows.filter((row) => row.category === category || row.category === "social") : rows;
  }

  async listProjects(): Promise<AdminProject[]> {
    const rows = await this.db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
    return Promise.all(rows.map((row) => this.project(row)));
  }

  async getProject(id: string) {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id));
    return row ? this.project(row) : null;
  }

  private async project(row: typeof projects.$inferSelect): Promise<AdminProject> {
    const useDraft = Boolean(row.draftContent) || row.status !== "published";
    const slot = useDraft ? "draft" : "published";
    const [categories, technologyRows, media] = await Promise.all([
      this.db.select({ id: projectCategoryAssignments.categoryId }).from(projectCategoryAssignments)
        .where(and(eq(projectCategoryAssignments.projectId, row.id), eq(projectCategoryAssignments.slot, slot))),
      this.db.select({ id: projectTechnologies.technologyId }).from(projectTechnologies)
        .where(and(eq(projectTechnologies.projectId, row.id), eq(projectTechnologies.slot, slot))),
      this.db.select({ id: projectMedia.mediaAssetId, role: projectMedia.role, sortOrder: projectMedia.sortOrder })
        .from(projectMedia).where(and(eq(projectMedia.projectId, row.id), eq(projectMedia.slot, slot))).orderBy(asc(projectMedia.sortOrder)),
    ]);
    return { id: row.id, status: row.status, revision: row.revision, updatedAt: row.updatedAt.toISOString(),
      publishedAt: iso(row.publishedAt), publicSlug: row.slug, isFeatured: row.isFeatured, draft: row.draftContent ?? projectPublicDraft(row),
      categoryIds: categories.map((item) => item.id), technologyIds: technologyRows.map((item) => item.id), media };
  }

  async listResearch(): Promise<AdminResearch[]> {
    const rows = await this.db.select().from(research).orderBy(asc(research.sortOrder), desc(research.updatedAt));
    return Promise.all(rows.map((row) => this.research(row)));
  }

  async getResearch(id: string) {
    const [row] = await this.db.select().from(research).where(eq(research.id, id));
    return row ? this.research(row) : null;
  }

  private async research(row: typeof research.$inferSelect): Promise<AdminResearch> {
    const useDraft = Boolean(row.draftContent) || row.status !== "published";
    const slot = useDraft ? "draft" : "published";
    const [technologyRows, media] = await Promise.all([
      this.db.select({ id: researchTechnologies.technologyId }).from(researchTechnologies)
        .where(and(eq(researchTechnologies.researchId, row.id), eq(researchTechnologies.slot, slot))),
      this.db.select({ id: researchMedia.mediaAssetId, role: researchMedia.role, sortOrder: researchMedia.sortOrder })
        .from(researchMedia).where(and(eq(researchMedia.researchId, row.id), eq(researchMedia.slot, slot))).orderBy(asc(researchMedia.sortOrder)),
    ]);
    return { id: row.id, status: row.status, revision: row.revision, updatedAt: row.updatedAt.toISOString(),
      publishedAt: iso(row.publishedAt), publicSlug: row.slug, isFeatured: row.isFeatured, draft: row.draftContent ?? researchPublicDraft(row),
      technologyIds: technologyRows.map((item) => item.id), media };
  }

  async listThoughts(): Promise<AdminThought[]> {
    const rows = await this.db.select().from(thoughts).orderBy(desc(thoughts.updatedAt));
    return Promise.all(rows.map((row) => this.thought(row)));
  }

  async getThought(id: string) {
    const [row] = await this.db.select().from(thoughts).where(eq(thoughts.id, id));
    return row ? this.thought(row) : null;
  }

  private async thought(row: typeof thoughts.$inferSelect): Promise<AdminThought> {
    const useDraft = Boolean(row.draftContent) || row.status !== "published";
    const slot = useDraft ? "draft" : "published";
    const media = await this.db.select({ id: thoughtMedia.mediaAssetId, role: thoughtMedia.role, sortOrder: thoughtMedia.sortOrder })
      .from(thoughtMedia).where(and(eq(thoughtMedia.thoughtId, row.id), eq(thoughtMedia.slot, slot))).orderBy(asc(thoughtMedia.sortOrder));
    return { id: row.id, status: row.status, revision: row.revision, updatedAt: row.updatedAt.toISOString(),
      publishedAt: iso(row.publishedAt), publicSlug: row.slug, draft: row.draftContent ?? thoughtPublicDraft(row), media };
  }

  listExperiences() { return this.db.select().from(experiences).orderBy(asc(experiences.sortOrder), desc(experiences.updatedAt)); }
  async getExperience(id: string) { return (await this.db.select().from(experiences).where(eq(experiences.id, id)))[0] ?? null; }
  listCredentials() { return this.db.select().from(credentials).orderBy(asc(credentials.sortOrder), desc(credentials.updatedAt)); }
  async getCredential(id: string) { return (await this.db.select().from(credentials).where(eq(credentials.id, id)))[0] ?? null; }

  async assertTaxonomy(categoryIds: string[], technologyIds: string[]) {
    const [categoryRows, technologyRows] = await Promise.all([
      categoryIds.length ? this.db.select({ id: projectCategories.id }).from(projectCategories).where(inArray(projectCategories.id, categoryIds)) : [],
      technologyIds.length ? this.db.select({ id: technologies.id }).from(technologies).where(inArray(technologies.id, technologyIds)) : [],
    ]);
    if (categoryRows.length !== new Set(categoryIds).size || technologyRows.length !== new Set(technologyIds).size) throw new Error("CMS_TAXONOMY_INVALID");
  }

  async assertMedia(ids: string[], publishing: boolean) {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    const rows = await this.db.select({ id: mediaAssets.id, access: mediaAssets.access }).from(mediaAssets)
      .where(and(inArray(mediaAssets.id, uniqueIds), eq(mediaAssets.availability, "ready"), eq(mediaAssets.kind, "image")));
    if (rows.length !== uniqueIds.length) throw new Error("CMS_MEDIA_INVALID");
    if (publishing && rows.some((row) => row.access !== "public")) throw new Error("CMS_MEDIA_PRIVATE");
  }
}
