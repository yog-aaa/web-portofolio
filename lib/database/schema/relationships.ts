import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, primaryKey, smallint, text, uniqueIndex, uuid, varchar, type AnyPgColumn } from "drizzle-orm/pg-core";
import { projects, research, thoughts } from "./editorial";
import { mediaAssets } from "./media";
import { profile } from "./site";
import { contentSlot, dateRange, httpsUrl, mediaRole, nonBlank, preciseDate, slugFormat, timestamps } from "./shared";

export const projectCategories = pgTable("project_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [nonBlank("category_name_nonempty", t.name), slugFormat("category_key_format", t.key), check("category_order_nonnegative", sql`${t.sortOrder} >= 0`)]);

export const technologies = pgTable("technologies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  referenceUrl: text("reference_url"),
  iconKey: text("icon_key"),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [nonBlank("technology_name_nonempty", t.name), slugFormat("technology_key_format", t.key), httpsUrl("technology_reference_https", t.referenceUrl), check("technology_order_nonnegative", sql`${t.sortOrder} >= 0`)]);

export const projectCategoryAssignments = pgTable("project_category_assignments", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => projectCategories.id, { onDelete: "restrict" }),
  slot: contentSlot("slot").notNull().default("draft"),
  ...timestamps(),
}, (t) => [primaryKey({ columns: [t.projectId, t.categoryId, t.slot] }), index("project_category_reverse_idx").on(t.categoryId)]);

export const projectTechnologies = pgTable("project_technologies", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  technologyId: uuid("technology_id").notNull().references(() => technologies.id, { onDelete: "restrict" }),
  slot: contentSlot("slot").notNull().default("draft"),
  ...timestamps(),
}, (t) => [primaryKey({ columns: [t.projectId, t.technologyId, t.slot] }), index("project_technology_reverse_idx").on(t.technologyId)]);

export const researchTechnologies = pgTable("research_technologies", {
  researchId: uuid("research_id").notNull().references(() => research.id, { onDelete: "cascade" }),
  technologyId: uuid("technology_id").notNull().references(() => technologies.id, { onDelete: "restrict" }),
  slot: contentSlot("slot").notNull().default("draft"),
  ...timestamps(),
}, (t) => [primaryKey({ columns: [t.researchId, t.technologyId, t.slot] }), index("research_technology_reverse_idx").on(t.technologyId)]);

export const experiences = pgTable("experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: smallint("profile_id").notNull().references(() => profile.id, { onDelete: "restrict" }),
  roleTitle: text("role_title").notNull(),
  organizationName: text("organization_name").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").notNull().default(false),
  contextLabel: text("context_label"),
  location: text("location"),
  organizationUrl: text("organization_url"),
  organizationMediaId: uuid("organization_media_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  isVisible: boolean("is_visible").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredOrder: integer("featured_order"),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [
  index("experience_profile_order_idx").on(t.profileId, t.sortOrder, t.id),
  uniqueIndex("experience_single_highlight").on(t.isFeatured).where(sql`${t.isFeatured}`),
  nonBlank("experience_role_nonempty", t.roleTitle), nonBlank("experience_organization_nonempty", t.organizationName), nonBlank("experience_description_nonempty", t.description),
  preciseDate("experience_start_date", t.startDate), preciseDate("experience_end_date", t.endDate), dateRange("experience_date_range", t.startDate, t.endDate),
  httpsUrl("experience_organization_https", t.organizationUrl),
  check("experience_current_no_end", sql`not ${t.isCurrent} or ${t.endDate} is null`),
  check("experience_order_nonnegative", sql`${t.sortOrder} >= 0`),
  check("experience_featured_visible", sql`not ${t.isFeatured} or ${t.isVisible}`),
  check("experience_featured_order", sql`(not ${t.isFeatured} and ${t.featuredOrder} is null) or
    (${t.isFeatured} and ${t.featuredOrder} is not null and ${t.featuredOrder} >= 0)`),
]);

export const experienceProjects = pgTable("experience_projects", {
  experienceId: uuid("experience_id").notNull().references(() => experiences.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [primaryKey({ columns: [t.experienceId, t.projectId] }), index("experience_project_reverse_idx").on(t.projectId)]);

const mediaReferenceColumns = () => ({
  id: uuid("id").defaultRandom().primaryKey(),
  mediaAssetId: uuid("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" }),
  slot: contentSlot("slot").notNull().default("draft"),
  role: mediaRole("role").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  altText: text("alt_text"),
  caption: text("caption"),
  isDecorative: boolean("is_decorative"),
  ...timestamps(),
});

const mediaReferenceIndexes = (name: string, owner: AnyPgColumn, t: Record<"slot" | "role" | "sortOrder" | "mediaAssetId", AnyPgColumn>) => [
  uniqueIndex(`${name}_position_unique`).on(owner, t.slot, t.role, t.sortOrder),
  uniqueIndex(`${name}_single_cover_social`).on(owner, t.slot, t.role).where(sql`${t.role} in ('cover', 'social')`),
  index(`${name}_asset_idx`).on(t.mediaAssetId),
  check(`${name}_order_nonnegative`, sql`${t.sortOrder} >= 0`),
];

export const projectMedia = pgTable("project_media", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  ...mediaReferenceColumns(),
}, (t) => [
  ...mediaReferenceIndexes("project_media", t.projectId, t),
  check("project_media_roles", sql`${t.role} in ('cover', 'gallery', 'body', 'social')`),
]);

export const researchMedia = pgTable("research_media", {
  researchId: uuid("research_id").notNull().references(() => research.id, { onDelete: "cascade" }),
  ...mediaReferenceColumns(),
}, (t) => [
  ...mediaReferenceIndexes("research_media", t.researchId, t),
  check("research_media_roles", sql`${t.role} in ('cover', 'figure', 'body', 'social')`),
]);

export const thoughtMedia = pgTable("thought_media", {
  thoughtId: uuid("thought_id").notNull().references(() => thoughts.id, { onDelete: "cascade" }),
  ...mediaReferenceColumns(),
}, (t) => [
  ...mediaReferenceIndexes("thought_media", t.thoughtId, t),
  check("thought_media_roles", sql`${t.role} in ('cover', 'body', 'social')`),
]);
