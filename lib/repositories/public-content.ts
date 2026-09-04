import "server-only";

import { and, asc, desc, eq, inArray, type AnyColumn } from "drizzle-orm";
import type { Database } from "../database/connection";
import { credentials, education, profile, sitePageSettings, siteSettings, socialLinks, themeSettings } from "../database/schema/site";
import { projects, research, thoughts } from "../database/schema/editorial";
import { experiences, projectCategories, projectCategoryAssignments, projectMedia,
  projectTechnologies, researchMedia, researchTechnologies, technologies, thoughtMedia } from "../database/schema/relationships";
import { mediaAssets } from "../database/schema/media";
import type { MediaImageData } from "../domain/media";
import type { PublicCredential, PublicEducation, PublicExperience, PublicMediaReference, PublicPageRoute, PublicPageSettings,
  PublicProfile, PublicProject, PublicProjectDetail, PublicResearch, PublicResearchDetail,
  PublicSiteSettings, PublicSocialLink, PublicTaxonomy, PublicThemeSettings,
  PublicThought, PublicThoughtDetail } from "../domain/content";

const published = (column: AnyColumn) => eq(column, "published");
const iso = (value: Date) => value.toISOString();
const validSlug = (value: string) => value.length <= 160 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

const publicImageSelection = {
  id: mediaAssets.id,
  access: mediaAssets.access,
  src: mediaAssets.secureUrl,
  width: mediaAssets.width,
  height: mediaAssets.height,
  altText: mediaAssets.altText,
  isDecorative: mediaAssets.isDecorative,
};
type SelectedImage = { id: string; access: "public" | "private"; src: string | null; width: number | null;
  height: number | null; altText: string | null; isDecorative: boolean };
function image(row: SelectedImage | null): MediaImageData | null {
  if (!row || row.access !== "public" || !row.src || !row.width || !row.height) return null;
  if (!row.isDecorative && !row.altText?.trim()) return null;
  return { id: row.id, access: "public", src: row.src, width: row.width, height: row.height,
    alt: row.isDecorative ? "" : row.altText ?? "" };
}
const publicReadyImage = and(eq(mediaAssets.access, "public"), eq(mediaAssets.availability, "ready"), eq(mediaAssets.kind, "image"));

type EditorialKind = "project" | "research" | "thought";
type MediaRow = { referenceId: string; ownerId: string; role: PublicMediaReference["role"]; sortOrder: number;
  referenceAltText: string | null; caption: string | null; referenceIsDecorative: boolean | null;
  assetId: string; assetAccess: "public" | "private"; assetSrc: string | null; assetWidth: number | null;
  assetHeight: number | null; assetAltText: string | null; assetIsDecorative: boolean };

export class PublicContentRepository {
  constructor(private readonly db: Database) {}

  async getSiteSettings(): Promise<PublicSiteSettings | null> {
    const [row] = await this.db.select({
      brandName: siteSettings.brandName, siteTitle: siteSettings.siteTitle,
      defaultSeoDescription: siteSettings.defaultSeoDescription, contentLanguage: siteSettings.contentLanguage,
      heroHeadline: siteSettings.heroHeadline, heroIntro: siteSettings.heroIntro,
      heroExploreLabel: siteSettings.heroExploreLabel, heroSupportingCopy: siteSettings.heroSupportingCopy,
      contactCtaHeading: siteSettings.contactCtaHeading, contactCtaLabel: siteSettings.contactCtaLabel,
      contactSupportingCopy: siteSettings.contactSupportingCopy, footerCopy: siteSettings.footerCopy,
      sectionCopy: siteSettings.sectionCopy, defaultSocialImage: publicImageSelection,
    }).from(siteSettings).leftJoin(mediaAssets,
      and(eq(siteSettings.defaultSocialImageId, mediaAssets.id), publicReadyImage)).where(eq(siteSettings.id, 1));
    return row ? { ...row, defaultSocialImage: image(row.defaultSocialImage) } : null;
  }

  async getPageSettings(route: PublicPageRoute): Promise<PublicPageSettings | null> {
    const [row] = await this.db.select({ route: sitePageSettings.route,
      intro: sitePageSettings.intro, emptyStateCopy: sitePageSettings.emptyStateCopy,
      seoTitle: sitePageSettings.seoTitle, seoDescription: sitePageSettings.seoDescription,
      socialImage: publicImageSelection,
    }).from(sitePageSettings).leftJoin(mediaAssets,
      and(eq(sitePageSettings.socialImageId, mediaAssets.id), publicReadyImage))
      .where(eq(sitePageSettings.route, route));
    return row ? { ...row, route: row.route as PublicPageRoute, socialImage: image(row.socialImage) } : null;
  }

  async getThemeSettings(): Promise<PublicThemeSettings | null> {
    const [row] = await this.db.select({ accent: themeSettings.accent,
      accentForeground: themeSettings.accentForeground, accentSoft: themeSettings.accentSoft,
      accentSecondary: themeSettings.accentSecondary }).from(themeSettings).where(eq(themeSettings.id, 1));
    return row ?? null;
  }

  async getProfile(): Promise<PublicProfile | null> {
    const [row] = await this.db.select({ displayName: profile.displayName, focusLine: profile.focusLine,
      shortBiography: profile.shortBiography, biographyMarkdown: profile.biographyMarkdown,
      location: profile.location, availabilityText: profile.availabilityText, resumeUrl: profile.resumeUrl,
      portrait: publicImageSelection }).from(profile).leftJoin(mediaAssets,
      and(eq(profile.portraitMediaId, mediaAssets.id), publicReadyImage)).where(eq(profile.id, 1));
    if (!row) return null;
    const [educationRows, linkRows] = await Promise.all([this.publicEducation(), this.publicSocialLinks()]);
    return { ...row, portrait: image(row.portrait), education: educationRows, socialLinks: linkRows };
  }

  async getPublishedProjects(): Promise<PublicProject[]> {
    const rows = await this.projectRows().orderBy(asc(projects.sortOrder), desc(projects.publishedAt), asc(projects.id));
    return this.hydrateProjects(rows);
  }

  async getFeaturedProjects(): Promise<PublicProject[]> {
    const rows = await this.projectRows(and(published(projects.status), eq(projects.isFeatured, true)))
      .orderBy(asc(projects.featuredOrder), asc(projects.id));
    return this.hydrateProjects(rows);
  }

  async getProjectBySlug(slug: string): Promise<PublicProjectDetail | null> {
    if (!validSlug(slug)) return null;
    const [row] = await this.projectRows(and(published(projects.status), eq(projects.slug, slug)));
    if (!row) return null;
    const [base] = await this.hydrateProjects([row]);
    return { ...base, bodyMarkdown: row.bodyMarkdown!, seoTitle: row.seoTitle,
      seoDescription: row.seoDescription, media: await this.media("project", [row.id]).then((map) => map.get(row.id) ?? []) };
  }

  async getExperiences(): Promise<PublicExperience[]> {
    const rows = await this.db.select({ id: experiences.id, roleTitle: experiences.roleTitle,
      organizationName: experiences.organizationName, description: experiences.description,
      startDate: experiences.startDate, endDate: experiences.endDate, isCurrent: experiences.isCurrent,
      contextLabel: experiences.contextLabel, location: experiences.location,
      organizationUrl: experiences.organizationUrl, organizationImage: publicImageSelection,
    }).from(experiences).leftJoin(mediaAssets,
      and(eq(experiences.organizationMediaId, mediaAssets.id), publicReadyImage))
      .where(eq(experiences.isVisible, true)).orderBy(asc(experiences.sortOrder), asc(experiences.id));
    return rows.map((row) => ({ ...row, organizationImage: image(row.organizationImage) }));
  }

  async getExperienceHighlight(): Promise<PublicExperience | null> {
    const [row] = await this.db.select({ id: experiences.id, roleTitle: experiences.roleTitle,
      organizationName: experiences.organizationName, description: experiences.description,
      startDate: experiences.startDate, endDate: experiences.endDate, isCurrent: experiences.isCurrent,
      contextLabel: experiences.contextLabel, location: experiences.location,
      organizationUrl: experiences.organizationUrl, organizationImage: publicImageSelection,
    }).from(experiences).leftJoin(mediaAssets,
      and(eq(experiences.organizationMediaId, mediaAssets.id), publicReadyImage))
      .where(and(eq(experiences.isVisible, true), eq(experiences.isFeatured, true)))
      .orderBy(asc(experiences.featuredOrder), asc(experiences.id)).limit(1);
    return row ? { ...row, organizationImage: image(row.organizationImage) } : null;
  }

  async getPublishedResearch(): Promise<PublicResearch[]> {
    const rows = await this.researchRows().orderBy(asc(research.sortOrder), desc(research.publishedAt), asc(research.id));
    return this.hydrateResearch(rows);
  }

  async getFeaturedResearch(): Promise<PublicResearch[]> {
    const rows = await this.researchRows(and(published(research.status), eq(research.isFeatured, true)))
      .orderBy(asc(research.featuredOrder), asc(research.id));
    return this.hydrateResearch(rows);
  }

  async getResearchBySlug(slug: string): Promise<PublicResearchDetail | null> {
    if (!validSlug(slug)) return null;
    const [row] = await this.researchRows(and(published(research.status), eq(research.slug, slug)));
    if (!row) return null;
    const [base] = await this.hydrateResearch([row]);
    return { ...base, bodyMarkdown: row.bodyMarkdown!, seoTitle: row.seoTitle,
      seoDescription: row.seoDescription, media: await this.media("research", [row.id]).then((map) => map.get(row.id) ?? []) };
  }

  async getPublishedThoughts(): Promise<PublicThought[]> {
    const rows = await this.thoughtRows().orderBy(desc(thoughts.publishedAt), asc(thoughts.id));
    return this.hydrateThoughts(rows);
  }

  async getLatestThoughts(limit: number): Promise<PublicThought[]> {
    const rows = await this.thoughtRows().orderBy(desc(thoughts.publishedAt), asc(thoughts.id)).limit(limit);
    return this.hydrateThoughts(rows);
  }

  async getThoughtBySlug(slug: string): Promise<PublicThoughtDetail | null> {
    if (!validSlug(slug)) return null;
    const [row] = await this.thoughtRows(and(published(thoughts.status), eq(thoughts.slug, slug)));
    if (!row) return null;
    const [base] = await this.hydrateThoughts([row]);
    return { ...base, bodyMarkdown: row.bodyMarkdown!, seoTitle: row.seoTitle,
      seoDescription: row.seoDescription, references: row.references,
      media: await this.media("thought", [row.id]).then((map) => map.get(row.id) ?? []) };
  }

  async getCredentials(): Promise<PublicCredential[]> {
    const rows = await this.db.select({ id: credentials.id, title: credentials.title,
      issuerName: credentials.issuerName, credentialType: credentials.credentialType,
      issueDate: credentials.issueDate, expiryDate: credentials.expiryDate,
      publicIdentifier: credentials.publicIdentifier, description: credentials.description,
      verificationUrl: credentials.verificationUrl, previewImage: publicImageSelection,
    }).from(credentials).leftJoin(mediaAssets,
      and(eq(credentials.previewMediaId, mediaAssets.id), publicReadyImage))
      .where(eq(credentials.isVisible, true)).orderBy(asc(credentials.sortOrder), asc(credentials.id));
    return rows.map((row) => ({ ...row, previewImage: image(row.previewImage) }));
  }

  private projectRows(where = published(projects.status)) {
    return this.db.select({ id: projects.id, slug: projects.slug, title: projects.title,
      summary: projects.summary, roleOrContribution: projects.roleOrContribution,
      startDate: projects.startDate, endDate: projects.endDate, collaborators: projects.collaborators,
      links: projects.links, publishedAt: projects.publishedAt, publicUpdatedAt: projects.publicUpdatedAt,
      bodyMarkdown: projects.bodyMarkdown, seoTitle: projects.seoTitle, seoDescription: projects.seoDescription,
    }).from(projects).where(where);
  }

  private researchRows(where = published(research.status)) {
    return this.db.select({ id: research.id, slug: research.slug, title: research.title,
      summary: research.summary, researchType: research.researchType, researchStage: research.researchStage,
      roleOrContribution: research.roleOrContribution, researchDate: research.researchDate,
      academicPublishedDate: research.academicPublishedDate, institution: research.institution,
      venue: research.venue, citationText: research.citationText, doi: research.doi,
      collaborators: research.collaborators, links: research.links, publishedAt: research.publishedAt,
      publicUpdatedAt: research.publicUpdatedAt, bodyMarkdown: research.bodyMarkdown,
      seoTitle: research.seoTitle, seoDescription: research.seoDescription,
    }).from(research).where(where);
  }

  private thoughtRows(where = published(thoughts.status)) {
    return this.db.select({ id: thoughts.id, slug: thoughts.slug, title: thoughts.title,
      excerpt: thoughts.excerpt, publishedAt: thoughts.publishedAt, publicUpdatedAt: thoughts.publicUpdatedAt,
      bodyMarkdown: thoughts.bodyMarkdown, seoTitle: thoughts.seoTitle,
      seoDescription: thoughts.seoDescription, references: thoughts.references,
    }).from(thoughts).where(where);
  }

  private async hydrateProjects(rows: Awaited<ReturnType<PublicContentRepository["projectRows"]>>): Promise<PublicProject[]> {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const [categoryMap, technologyMap, mediaMap] = await Promise.all([
      this.projectTaxonomies(ids), this.technologyTaxonomies("project", ids), this.media("project", ids),
    ]);
    return rows.map((row) => ({ id: row.id, slug: row.slug!, title: row.title, summary: row.summary!,
      roleOrContribution: row.roleOrContribution!, startDate: row.startDate, endDate: row.endDate,
      collaborators: row.collaborators, links: row.links, publishedAt: iso(row.publishedAt!),
      publicUpdatedAt: iso(row.publicUpdatedAt!), categories: categoryMap.get(row.id) ?? [],
      technologies: technologyMap.get(row.id) ?? [], cover: (mediaMap.get(row.id) ?? []).find((item) => item.role === "cover") ?? null }));
  }

  private async hydrateResearch(rows: Awaited<ReturnType<PublicContentRepository["researchRows"]>>): Promise<PublicResearch[]> {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const [technologyMap, mediaMap] = await Promise.all([this.technologyTaxonomies("research", ids), this.media("research", ids)]);
    return rows.map((row) => ({ id: row.id, slug: row.slug!, title: row.title, summary: row.summary!,
      researchType: row.researchType!, researchStage: row.researchStage,
      roleOrContribution: row.roleOrContribution!, researchDate: row.researchDate,
      academicPublishedDate: row.academicPublishedDate, institution: row.institution, venue: row.venue,
      citationText: row.citationText, doi: row.doi, collaborators: row.collaborators, links: row.links,
      publishedAt: iso(row.publishedAt!), publicUpdatedAt: iso(row.publicUpdatedAt!),
      technologies: technologyMap.get(row.id) ?? [], cover: (mediaMap.get(row.id) ?? []).find((item) => item.role === "cover") ?? null }));
  }

  private async hydrateThoughts(rows: Awaited<ReturnType<PublicContentRepository["thoughtRows"]>>): Promise<PublicThought[]> {
    if (!rows.length) return [];
    const mediaMap = await this.media("thought", rows.map((row) => row.id));
    return rows.map((row) => ({ id: row.id, slug: row.slug!, title: row.title, excerpt: row.excerpt!,
      publishedAt: iso(row.publishedAt!), publicUpdatedAt: iso(row.publicUpdatedAt!),
      cover: (mediaMap.get(row.id) ?? []).find((item) => item.role === "cover") ?? null }));
  }

  private async publicEducation(): Promise<PublicEducation[]> {
    const rows = await this.db.select({ id: education.id, institutionName: education.institutionName,
      qualificationOrProgram: education.qualificationOrProgram, fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate, endDate: education.endDate, isCurrent: education.isCurrent,
      description: education.description, institutionUrl: education.institutionUrl,
      gpaValue: education.gpaValue, gpaScale: education.gpaScale,
      institutionImage: publicImageSelection }).from(education).leftJoin(mediaAssets,
      and(eq(education.institutionMediaId, mediaAssets.id), publicReadyImage))
      .where(eq(education.isVisible, true)).orderBy(asc(education.sortOrder), asc(education.id));
    return rows.map((row) => ({ ...row, institutionImage: image(row.institutionImage) }));
  }

  private async publicSocialLinks(): Promise<PublicSocialLink[]> {
    return this.db.select({ id: socialLinks.id, label: socialLinks.label,
      destination: socialLinks.destination, purpose: socialLinks.purpose,
      platformKey: socialLinks.platformKey }).from(socialLinks)
      .where(eq(socialLinks.isVisible, true)).orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id));
  }

  private async projectTaxonomies(ids: string[]) {
    const rows = await this.db.select({ ownerId: projectCategoryAssignments.projectId,
      key: projectCategories.key, name: projectCategories.name }).from(projectCategoryAssignments)
      .innerJoin(projectCategories, eq(projectCategoryAssignments.categoryId, projectCategories.id))
      .where(and(inArray(projectCategoryAssignments.projectId, ids), eq(projectCategoryAssignments.slot, "published")))
      .orderBy(asc(projectCategories.sortOrder), asc(projectCategories.id));
    return this.groupTaxonomies(rows);
  }

  private async technologyTaxonomies(kind: "project" | "research", ids: string[]) {
    const table = kind === "project" ? projectTechnologies : researchTechnologies;
    const owner = kind === "project" ? projectTechnologies.projectId : researchTechnologies.researchId;
    const rows = await this.db.select({ ownerId: owner, key: technologies.key, name: technologies.name })
      .from(table).innerJoin(technologies, eq(table.technologyId, technologies.id))
      .where(and(inArray(owner, ids), eq(table.slot, "published")))
      .orderBy(asc(technologies.sortOrder), asc(technologies.id));
    return this.groupTaxonomies(rows);
  }

  private groupTaxonomies(rows: { ownerId: string; key: string; name: string }[]) {
    const map = new Map<string, PublicTaxonomy[]>();
    for (const row of rows) map.set(row.ownerId, [...(map.get(row.ownerId) ?? []), { key: row.key, name: row.name }]);
    return map;
  }

  private async media(kind: EditorialKind, ids: string[]) {
    const reference = kind === "project" ? projectMedia : kind === "research" ? researchMedia : thoughtMedia;
    const owner = kind === "project" ? projectMedia.projectId : kind === "research" ? researchMedia.researchId : thoughtMedia.thoughtId;
    const rows = await this.db.select({ ownerId: owner, referenceId: reference.id, role: reference.role,
      sortOrder: reference.sortOrder, referenceAltText: reference.altText, caption: reference.caption,
      referenceIsDecorative: reference.isDecorative, assetId: mediaAssets.id, assetAccess: mediaAssets.access,
      assetSrc: mediaAssets.secureUrl, assetWidth: mediaAssets.width, assetHeight: mediaAssets.height,
      assetAltText: mediaAssets.altText, assetIsDecorative: mediaAssets.isDecorative }).from(reference)
      .innerJoin(mediaAssets, and(eq(reference.mediaAssetId, mediaAssets.id), publicReadyImage))
      .where(and(inArray(owner, ids), eq(reference.slot, "published")))
      .orderBy(asc(owner), asc(reference.sortOrder), asc(reference.id)) as MediaRow[];
    const map = new Map<string, PublicMediaReference[]>();
    for (const row of rows) {
      const resolvedDecorative = row.referenceIsDecorative ?? row.assetIsDecorative;
      const resolvedAlt = resolvedDecorative ? "" : row.referenceAltText ?? row.assetAltText ?? "";
      const mediaImage = image({ id: row.assetId, access: row.assetAccess, src: row.assetSrc,
        width: row.assetWidth, height: row.assetHeight, altText: resolvedAlt, isDecorative: resolvedDecorative });
      if (!mediaImage) continue;
      const item: PublicMediaReference = { id: row.referenceId, role: row.role, alt: resolvedAlt,
        caption: row.caption, isDecorative: resolvedDecorative, image: { ...mediaImage, alt: resolvedAlt } };
      map.set(row.ownerId, [...(map.get(row.ownerId) ?? []), item]);
    }
    return map;
  }
}
