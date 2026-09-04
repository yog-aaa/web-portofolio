import { z } from "zod";
import type { ContentLink } from "../domain/content-values";

const optionalText = (maximum: number) => z.string().trim().max(maximum).transform((value) => value || null);
const requiredText = (label: string, maximum: number) => z.string().trim().min(1, `${label} is required.`).max(maximum);
const slug = z.string().trim().max(160).refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
  "Use lowercase letters, numbers, and hyphens only.").transform((value) => value || null);
const preciseDate = z.string().trim().refine((value) => !value || /^[1-9]\d{3}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(value),
  "Use YYYY, YYYY-MM, or YYYY-MM-DD.").transform((value) => value || null);
const optionalHttps = z.string().trim().max(2048).refine((value) => !value || /^https:\/\/\S+$/.test(value),
  "Use a complete HTTPS URL.").transform((value) => value || null);
const uuid = z.string().uuid();
const optionalUuid = z.string().trim().transform((value) => value || null).pipe(z.string().uuid().nullable());
const nonnegativeInteger = z.coerce.number().int().min(0).max(1_000_000);

export type AdminActionState = { status: "idle" | "error"; message?: string; fields?: Record<string, string[]> };
export const initialAdminActionState: AdminActionState = { status: "idle" };

export function checkbox(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export function formStrings(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean);
}

export function parseLinks(value: string): ContentLink[] {
  if (!value.trim()) return [];
  return value.split(/\r?\n/).map((line, index) => {
    const separator = line.indexOf("|");
    if (separator < 1) throw new Error(`Link line ${index + 1} must use Label | https://example.com.`);
    const label = line.slice(0, separator).trim();
    const url = line.slice(separator + 1).trim();
    if (!label || label.length > 120 || !/^https:\/\/\S+$/.test(url) || url.length > 2048) {
      throw new Error(`Link line ${index + 1} is invalid.`);
    }
    return { label, url };
  });
}

const editorialBase = z.object({
  id: optionalUuid,
  expectedRevision: z.coerce.number().int().min(0),
  intent: z.enum(["save", "publish"]),
  title: requiredText("Title", 200),
  slug,
  bodyMarkdown: optionalText(200_000),
  seoTitle: optionalText(120),
  seoDescription: optionalText(320),
});

export const projectInputSchema = editorialBase.extend({
  summary: optionalText(1_000),
  roleOrContribution: optionalText(2_000),
  startDate: preciseDate,
  endDate: preciseDate,
  isFeatured: z.boolean(),
  featuredOrder: z.coerce.number().int().min(0).max(1_000_000).nullable(),
  sortOrder: nonnegativeInteger,
  categoryIds: z.array(uuid).max(30),
  technologyIds: z.array(uuid).max(60),
  coverMediaId: optionalUuid,
  galleryMediaIds: z.array(uuid).max(50),
  links: z.array(z.object({ label: requiredText("Link label", 120), url: z.string().url().startsWith("https://").max(2048) })).max(30),
}).superRefine((value, context) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) context.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date." });
  if (value.isFeatured && value.featuredOrder === null) context.addIssue({ code: "custom", path: ["featuredOrder"], message: "Featured order is required." });
  if (value.intent === "publish") {
    for (const [field, content] of [["slug", value.slug], ["summary", value.summary], ["roleOrContribution", value.roleOrContribution], ["bodyMarkdown", value.bodyMarkdown]] as const) {
      if (!content) context.addIssue({ code: "custom", path: [field], message: `${field} is required to publish.` });
    }
    if (!value.categoryIds.length) context.addIssue({ code: "custom", path: ["categoryIds"], message: "Choose at least one category before publishing." });
  }
});

export const researchInputSchema = editorialBase.extend({
  summary: optionalText(1_000),
  researchType: optionalText(160),
  researchStage: optionalText(160),
  roleOrContribution: optionalText(2_000),
  researchDate: preciseDate,
  academicPublishedDate: preciseDate,
  institution: optionalText(240),
  venue: optionalText(240),
  citationText: optionalText(4_000),
  doi: optionalText(512),
  isFeatured: z.boolean(),
  featuredOrder: z.coerce.number().int().min(0).max(1_000_000).nullable(),
  sortOrder: nonnegativeInteger,
  technologyIds: z.array(uuid).max(60),
  coverMediaId: optionalUuid,
  figureMediaIds: z.array(uuid).max(50),
  links: z.array(z.object({ label: requiredText("Resource label", 120), url: z.string().url().startsWith("https://").max(2048) })).max(30),
}).superRefine((value, context) => {
  if (value.isFeatured && value.featuredOrder === null) context.addIssue({ code: "custom", path: ["featuredOrder"], message: "Featured order is required." });
  if (value.intent === "publish") {
    for (const [field, content] of [["slug", value.slug], ["summary", value.summary], ["researchType", value.researchType], ["roleOrContribution", value.roleOrContribution], ["bodyMarkdown", value.bodyMarkdown]] as const) {
      if (!content) context.addIssue({ code: "custom", path: [field], message: `${field} is required to publish.` });
    }
  }
});

export const thoughtInputSchema = editorialBase.extend({
  excerpt: optionalText(1_000),
  category: optionalText(80),
  coverMediaId: optionalUuid,
  references: z.array(z.object({ label: requiredText("Reference label", 120), url: z.string().url().startsWith("https://").max(2048) })).max(50),
}).superRefine((value, context) => {
  if (value.category && /[<>\r\n]/.test(value.category)) context.addIssue({ code: "custom", path: ["category"], message: "Category contains unsupported characters." });
  if (value.intent === "publish") {
    for (const [field, content] of [["slug", value.slug], ["excerpt", value.excerpt], ["bodyMarkdown", value.bodyMarkdown]] as const) {
      if (!content) context.addIssue({ code: "custom", path: [field], message: `${field} is required to publish.` });
    }
  }
});

export const lifecycleInputSchema = z.object({
  type: z.enum(["project", "research", "thought"]),
  id: uuid,
  expectedRevision: z.coerce.number().int().min(0),
  operation: z.enum(["archive", "restore", "unpublish", "feature", "unfeature"]),
});

export const experienceInputSchema = z.object({
  id: optionalUuid,
  expectedUpdatedAt: z.string().datetime().nullable(),
  roleTitle: requiredText("Role or title", 200),
  organizationName: requiredText("Organization", 240),
  contextLabel: z.enum(["Professional", "Organization", "Community", "Freelance / Project"]),
  startDate: preciseDate.refine(Boolean, "Start date is required."),
  endDate: preciseDate,
  isCurrent: z.boolean(),
  description: requiredText("Description", 5_000),
  location: optionalText(240),
  organizationUrl: optionalHttps,
  sortOrder: nonnegativeInteger,
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
}).superRefine((value, context) => {
  if (value.isCurrent && value.endDate) context.addIssue({ code: "custom", path: ["endDate"], message: "Current entries cannot have an end date." });
  if (!value.isCurrent && value.startDate && value.endDate && value.endDate < value.startDate) context.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date." });
  if (value.isFeatured && !value.isVisible) context.addIssue({ code: "custom", path: ["isFeatured"], message: "The homepage highlight must be visible." });
});

export const credentialInputSchema = z.object({
  id: optionalUuid,
  expectedUpdatedAt: z.string().datetime().nullable(),
  title: requiredText("Name", 240),
  issuerName: requiredText("Issuer", 240),
  credentialType: z.enum(["AI", "Software", "Cloud", "Security", "Other"]),
  issueDate: preciseDate,
  expiryDate: preciseDate,
  publicIdentifier: optionalText(240),
  description: optionalText(2_000),
  verificationUrl: optionalHttps,
  previewMediaId: optionalUuid,
  sortOrder: nonnegativeInteger,
  isVisible: z.boolean(),
}).superRefine((value, context) => {
  if (value.issueDate && value.expiryDate && value.expiryDate < value.issueDate) context.addIssue({ code: "custom", path: ["expiryDate"], message: "Expiry date cannot be before issue date." });
});

export const deleteCollectionInputSchema = z.object({
  type: z.enum(["experience", "credential"]),
  id: uuid,
  expectedUpdatedAt: z.string().datetime(),
});

export const taxonomyInputSchema = z.object({
  kind: z.enum(["category", "technology"]),
  name: requiredText("Name", 80),
  returnTo: z.enum(["projects", "research"]),
});

export function actionError(error: unknown): AdminActionState {
  if (error instanceof z.ZodError) {
    const fields = z.flattenError(error).fieldErrors;
    return { status: "error", message: error.issues[0]?.message ?? "Check the highlighted fields.", fields };
  }
  if (error instanceof Error && error.message.startsWith("CMS_")) {
    const messages: Record<string, string> = {
      CMS_STALE: "This entry changed in another tab. Reload before saving again.",
      CMS_NOT_FOUND: "This entry no longer exists.",
      CMS_SLUG_TAKEN: "That slug is already reserved by another entry.",
      CMS_PROFILE_REQUIRED: "Create the site profile before adding content.",
      CMS_MEDIA_INVALID: "One or more selected media assets are unavailable.",
      CMS_MEDIA_PRIVATE: "Published content can only use public media assets.",
      CMS_TAXONOMY_INVALID: "One or more selected categories or technologies are unavailable.",
      CMS_INVALID_STATE: "That operation is not allowed for the current publication state.",
    };
    return { status: "error", message: messages[error.message] ?? "The content could not be saved." };
  }
  if (error instanceof Error && error.message === "SETTINGS_STALE") {
    return { status: "error", message: "These settings changed in another tab. Reload before saving again." };
  }
  if (error instanceof Error && error.message.startsWith("SETTINGS_SOCIAL_FORMAT:")) {
    const line = error.message.split(":")[1];
    return { status: "error", message: `Social link line ${line} must use Label | https://example.com.` };
  }
  return { status: "error", message: "The content could not be saved. Please try again." };
}
