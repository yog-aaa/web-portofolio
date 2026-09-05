import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, numeric, pgTable, smallint, text, uuid } from "drizzle-orm/pg-core";
import type { SectionCopy } from "../../domain/content-values";
import { mediaAssets } from "./media";
import { dateRange, httpsUrl, nonBlank, preciseDate, timestamps } from "./shared";

export const profile = pgTable("profile", {
  id: smallint("id").primaryKey().default(1),
  displayName: text("display_name").notNull(),
  focusLine: text("focus_line"),
  shortBiography: text("short_biography"),
  biographyMarkdown: text("biography_markdown"),
  location: text("location"),
  availabilityText: text("availability_text"),
  resumeUrl: text("resume_url"),
  portraitMediaId: uuid("portrait_media_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [check("profile_singleton", sql`${t.id} = 1`), nonBlank("profile_name_nonempty", t.displayName), httpsUrl("profile_resume_https", t.resumeUrl)]);

export const themeSettings = pgTable("theme_settings", {
  id: smallint("id").primaryKey().default(1),
  background: text("background"),
  surface: text("surface"),
  foreground: text("foreground"),
  border: text("border"),
  accent: text("accent"),
  accentForeground: text("accent_foreground"),
  accentSoft: text("accent_soft"),
  accentSecondary: text("accent_secondary"),
  ...timestamps(),
}, (t) => [
  check("theme_singleton", sql`${t.id} = 1`),
  ...[t.background, t.surface, t.foreground, t.border, t.accent,
    t.accentForeground, t.accentSoft, t.accentSecondary].map((column) =>
    check(`theme_${column.name}_hex`, sql`${column} is null or ${column} ~ '^#[0-9A-Fa-f]{6}$'`)),
]);

export const socialLinks = pgTable("social_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: smallint("profile_id").notNull().references(() => profile.id, { onDelete: "restrict" }),
  label: text("label").notNull(),
  destination: text("destination").notNull(),
  purpose: text("purpose").$type<"social" | "contact">().notNull(),
  platformKey: text("platform_key"),
  isVisible: boolean("is_visible").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [
  index("social_links_profile_order_idx").on(t.profileId, t.sortOrder, t.id),
  nonBlank("social_link_label_nonempty", t.label),
  check("social_link_purpose", sql`${t.purpose} in ('social', 'contact')`),
  check("social_link_destination", sql`${t.destination} ~ '^https://[^[:space:]]+$'
    or (${t.purpose} = 'contact' and ${t.destination} ~ '^mailto:[^[:space:]@]+@[^[:space:]@]+$')`),
  check("social_link_order_nonnegative", sql`${t.sortOrder} >= 0`),
]);

export const siteSettings = pgTable("site_settings", {
  id: smallint("id").primaryKey().default(1),
  profileId: smallint("profile_id").notNull().unique().references(() => profile.id, { onDelete: "restrict" }),
  themeSettingsId: smallint("theme_settings_id").notNull().unique().references(() => themeSettings.id, { onDelete: "restrict" }),
  brandName: text("brand_name").notNull(),
  siteTitle: text("site_title"),
  defaultSeoDescription: text("default_seo_description"),
  contentLanguage: text("content_language"),
  heroHeadline: text("hero_headline"),
  heroIntro: text("hero_intro"),
  heroExploreLabel: text("hero_explore_label"),
  heroSupportingCopy: text("hero_supporting_copy"),
  contactCtaHeading: text("contact_cta_heading"),
  contactCtaLabel: text("contact_cta_label"),
  contactSupportingCopy: text("contact_supporting_copy"),
  footerCopy: text("footer_copy"),
  sectionCopy: jsonb("section_copy").$type<SectionCopy>().notNull().default({}),
  primaryContactLinkId: uuid("primary_contact_link_id").references(() => socialLinks.id, { onDelete: "restrict" }),
  defaultSocialImageId: uuid("default_social_image_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [
  check("site_settings_singleton", sql`${t.id} = 1`), nonBlank("site_brand_nonempty", t.brandName),
  check("site_section_copy_keys", sql`jsonb_typeof(${t.sectionCopy}) = 'object'
    and ${t.sectionCopy} - array['hero','selectedWork','experienceHighlight','education','featuredResearch','latestThoughts','shortAbout','contact','footer']::text[] = '{}'::jsonb`),
]);

// Seven fixed route records with concrete fields, not an arbitrary SEO/EAV store.
export const sitePageSettings = pgTable("site_page_settings", {
  route: text("route").primaryKey(),
  siteSettingsId: smallint("site_settings_id").notNull().references(() => siteSettings.id, { onDelete: "restrict" }),
  intro: text("intro"),
  emptyStateCopy: text("empty_state_copy"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  socialImageId: uuid("social_image_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [check("site_page_known_route", sql`${t.route} in ('/', '/work', '/experience', '/research', '/thoughts', '/about', '/credentials')`)]);

export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: smallint("profile_id").notNull().references(() => profile.id, { onDelete: "restrict" }),
  institutionName: text("institution_name").notNull(),
  qualificationOrProgram: text("qualification_or_program").notNull(),
  fieldOfStudy: text("field_of_study"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: boolean("is_current"),
  description: text("description"),
  institutionUrl: text("institution_url"),
  institutionMediaId: uuid("institution_media_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  gpaValue: numeric("gpa_value", { precision: 6, scale: 3 }),
  gpaScale: numeric("gpa_scale", { precision: 6, scale: 3 }),
  isVisible: boolean("is_visible").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [
  index("education_profile_order_idx").on(t.profileId, t.sortOrder, t.id),
  nonBlank("education_institution_nonempty", t.institutionName), nonBlank("education_program_nonempty", t.qualificationOrProgram),
  preciseDate("education_start_date", t.startDate), preciseDate("education_end_date", t.endDate),
  dateRange("education_date_range", t.startDate, t.endDate), httpsUrl("education_institution_https", t.institutionUrl),
  check("education_current_no_end", sql`${t.isCurrent} is not true or ${t.endDate} is null`),
  check("education_order_nonnegative", sql`${t.sortOrder} >= 0`),
  check("education_gpa_pair", sql`(${t.gpaValue} is null and ${t.gpaScale} is null) or
    (${t.gpaValue} is not null and ${t.gpaScale} is not null and ${t.gpaScale} > 0 and ${t.gpaValue} >= 0 and ${t.gpaValue} <= ${t.gpaScale})`),
]);

export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: smallint("profile_id").notNull().references(() => profile.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  issuerName: text("issuer_name").notNull(),
  credentialType: text("credential_type").notNull(),
  issueDate: text("issue_date"),
  expiryDate: text("expiry_date"),
  publicIdentifier: text("public_identifier"),
  description: text("description"),
  verificationUrl: text("verification_url"),
  previewMediaId: uuid("preview_media_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  isVisible: boolean("is_visible").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps(),
}, (t) => [
  index("credentials_profile_order_idx").on(t.profileId, t.sortOrder, t.id),
  nonBlank("credential_title_nonempty", t.title), nonBlank("credential_issuer_nonempty", t.issuerName), nonBlank("credential_type_nonempty", t.credentialType),
  preciseDate("credential_issue_date", t.issueDate), preciseDate("credential_expiry_date", t.expiryDate),
  dateRange("credential_date_range", t.issueDate, t.expiryDate), httpsUrl("credential_verification_https", t.verificationUrl),
  check("credential_order_nonnegative", sql`${t.sortOrder} >= 0`),
]);
