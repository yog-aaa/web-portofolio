import { sql } from "drizzle-orm";
import { boolean, check, foreignKey, index, integer, jsonb, pgTable, smallint, text, timestamp, unique, uuid, varchar, type AnyPgColumn } from "drizzle-orm/pg-core";
import type { CollaboratorCredit, ContentLink, EditorialDraft, ProjectDraft, ResearchDraft, ThoughtDraft } from "../../domain/content-values";
import { profile } from "./site";
import { dateRange, draftShape, nonBlank, preciseDate, publicationStatus, slugFormat, timestamps } from "./shared";

const editorialColumns = <T extends EditorialDraft>() => ({
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: smallint("profile_id").notNull().default(1).references(() => profile.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 160 }).unique(),
  bodyMarkdown: text("body_markdown"),
  bodyFormat: text("body_format").$type<"markdown">().notNull().default("markdown"),
  status: publicationStatus("status").notNull().default("draft"),
  draftContent: jsonb("draft_content").$type<T>(),
  revision: integer("revision").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publicUpdatedAt: timestamp("public_updated_at", { withTimezone: true }),
  ...timestamps(),
});

type EditorialColumns = Record<"title" | "slug" | "bodyMarkdown" | "bodyFormat" | "status" | "draftContent" | "revision" | "publishedAt" | "publicUpdatedAt", AnyPgColumn>;
const editorialChecks = (name: string, t: EditorialColumns) => [
  nonBlank(`${name}_title_nonempty`, t.title), slugFormat(`${name}_slug_format`, t.slug),
  draftShape(`${name}_draft_shape`, t.draftContent),
  check(`${name}_markdown_only`, sql`${t.bodyFormat} = 'markdown'`),
  check(`${name}_revision_nonnegative`, sql`${t.revision} >= 0`),
  check(`${name}_public_dates`, sql`(${t.publishedAt} is null and ${t.publicUpdatedAt} is null) or
    (${t.publishedAt} is not null and ${t.publicUpdatedAt} is not null and ${t.publicUpdatedAt} >= ${t.publishedAt})`),
  check(`${name}_publication_required`, sql`${t.status} <> 'published' or (
    ${t.slug} is not null and ${t.bodyMarkdown} is not null and length(trim(${t.bodyMarkdown})) > 0
    and ${t.publishedAt} is not null and ${t.publicUpdatedAt} is not null
  )`),
];

const curatedColumns = () => ({
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredOrder: integer("featured_order"),
  sortOrder: integer("sort_order").notNull().default(0),
});
const curatedChecks = (name: string, t: Record<"isFeatured" | "featuredOrder" | "sortOrder", AnyPgColumn>) => [
  check(`${name}_sort_nonnegative`, sql`${t.sortOrder} >= 0`),
  check(`${name}_featured_order`, sql`(not ${t.isFeatured} and ${t.featuredOrder} is null) or
    (${t.isFeatured} and ${t.featuredOrder} is not null and ${t.featuredOrder} >= 0)`),
];

export const projects = pgTable("projects", {
  ...editorialColumns<ProjectDraft>(),
  summary: text("summary"),
  roleOrContribution: text("role_or_contribution"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  collaborators: jsonb("collaborators").$type<CollaboratorCredit[]>().notNull().default([]),
  links: jsonb("links").$type<ContentLink[]>().notNull().default([]),
  ...curatedColumns(),
}, (t) => [
  ...editorialChecks("projects", t), ...curatedChecks("projects", t),
  check("projects_required_summary_role", sql`${t.status} <> 'published' or (
    ${t.summary} is not null and length(trim(${t.summary})) > 0
    and ${t.roleOrContribution} is not null and length(trim(${t.roleOrContribution})) > 0)`),
  check("projects_value_arrays", sql`jsonb_typeof(${t.collaborators}) = 'array' and jsonb_typeof(${t.links}) = 'array'`),
  preciseDate("projects_start_date", t.startDate), preciseDate("projects_end_date", t.endDate), dateRange("projects_date_range", t.startDate, t.endDate),
  index("projects_archive_idx").on(t.sortOrder, t.publishedAt.desc(), t.id).where(sql`${t.status} = 'published'`),
  index("projects_featured_idx").on(t.featuredOrder, t.id).where(sql`${t.status} = 'published' and ${t.isFeatured}`),
  index("projects_profile_idx").on(t.profileId),
  foreignKey({ name: "projects_reserved_slug_fk", columns: [t.id, t.slug], foreignColumns: [projectSlugs.projectId, projectSlugs.slug] }).onDelete("restrict"),
]);

export const projectSlugs = pgTable("project_slugs", {
  slug: varchar("slug", { length: 160 }).primaryKey(),
  projectId: uuid("project_id").notNull().references((): AnyPgColumn => projects.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [unique("project_slug_owner_unique").on(t.projectId, t.slug), slugFormat("project_slug_format", t.slug)]);

export const research = pgTable("research", {
  ...editorialColumns<ResearchDraft>(),
  summary: text("summary"),
  researchType: text("research_type"),
  researchStage: text("research_stage"),
  roleOrContribution: text("role_or_contribution"),
  researchDate: text("research_date"),
  academicPublishedDate: text("academic_published_date"),
  institution: text("institution"),
  venue: text("venue"),
  citationText: text("citation_text"),
  doi: text("doi"),
  collaborators: jsonb("collaborators").$type<CollaboratorCredit[]>().notNull().default([]),
  links: jsonb("links").$type<ContentLink[]>().notNull().default([]),
  ...curatedColumns(),
}, (t) => [
  ...editorialChecks("research", t), ...curatedChecks("research", t),
  check("research_required_fields", sql`${t.status} <> 'published' or (
    ${t.summary} is not null and length(trim(${t.summary})) > 0
    and ${t.researchType} is not null and length(trim(${t.researchType})) > 0
    and ${t.roleOrContribution} is not null and length(trim(${t.roleOrContribution})) > 0)`),
  check("research_value_arrays", sql`jsonb_typeof(${t.collaborators}) = 'array' and jsonb_typeof(${t.links}) = 'array'`),
  preciseDate("research_known_date", t.researchDate), preciseDate("research_academic_date", t.academicPublishedDate),
  index("research_archive_idx").on(t.sortOrder, t.publishedAt.desc(), t.id).where(sql`${t.status} = 'published'`),
  index("research_featured_idx").on(t.featuredOrder, t.id).where(sql`${t.status} = 'published' and ${t.isFeatured}`),
  index("research_profile_idx").on(t.profileId),
  foreignKey({ name: "research_reserved_slug_fk", columns: [t.id, t.slug], foreignColumns: [researchSlugs.researchId, researchSlugs.slug] }).onDelete("restrict"),
]);

export const researchSlugs = pgTable("research_slugs", {
  slug: varchar("slug", { length: 160 }).primaryKey(),
  researchId: uuid("research_id").notNull().references((): AnyPgColumn => research.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [unique("research_slug_owner_unique").on(t.researchId, t.slug), slugFormat("research_slug_format", t.slug)]);

export const thoughts = pgTable("thoughts", {
  ...editorialColumns<ThoughtDraft>(),
  excerpt: text("excerpt"),
  references: jsonb("references").$type<ContentLink[]>().notNull().default([]),
}, (t) => [
  ...editorialChecks("thoughts", t),
  check("thoughts_required_excerpt", sql`${t.status} <> 'published' or (${t.excerpt} is not null and length(trim(${t.excerpt})) > 0)`),
  check("thoughts_references_array", sql`jsonb_typeof(${t.references}) = 'array'`),
  index("thoughts_latest_idx").on(t.publishedAt.desc(), t.id).where(sql`${t.status} = 'published'`),
  index("thoughts_profile_idx").on(t.profileId),
  foreignKey({ name: "thoughts_reserved_slug_fk", columns: [t.id, t.slug], foreignColumns: [thoughtSlugs.thoughtId, thoughtSlugs.slug] }).onDelete("restrict"),
]);

export const thoughtSlugs = pgTable("thought_slugs", {
  slug: varchar("slug", { length: 160 }).primaryKey(),
  thoughtId: uuid("thought_id").notNull().references((): AnyPgColumn => thoughts.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [unique("thought_slug_owner_unique").on(t.thoughtId, t.slug), slugFormat("thought_slug_format", t.slug)]);
