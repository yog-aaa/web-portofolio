"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { publicContentTags } from "@/lib/queries/content-cache";
import type { AdminContentService } from "@/lib/services/admin-content";
import { getAdminContentService } from "@/lib/services/admin-content-server";
import { actionError, checkbox, credentialInputSchema, deleteCollectionInputSchema,
  deleteTaxonomyInputSchema, experienceInputSchema, formStrings, lifecycleInputSchema,
  masterTaxonomyInputSchema, parseLinks,
  projectInputSchema, researchInputSchema, thoughtInputSchema,
  taxonomyInputSchema, type AdminActionState } from "@/lib/validation/admin-content";

const service = getAdminContentService;
const value = (formData: FormData, name: string) => String(formData.get(name) ?? "");
const nullableNumber = (input: string) => input.trim() ? Number(input) : null;
const unique = (values: string[]) => [...new Set(values)];

function refresh(type: "projects" | "research" | "thoughts" | "experience" | "credentials", slug?: string | null) {
  updateTag(publicContentTags[type]);
  revalidatePath("/");
  revalidatePath(`/admin/${type}`);
  const publicPath = type === "projects" ? "/work" : `/${type}`;
  revalidatePath(publicPath);
  if (type === "projects" || type === "research" || type === "thoughts") {
    revalidatePath(`${publicPath}/[slug]`, "page");
    if (slug) revalidatePath(`${publicPath}/${slug}`);
  }
}

export async function saveProjectAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let result: Awaited<ReturnType<AdminContentService["saveProject"]>>;
  let input;
  try {
    input = projectInputSchema.parse({ id: value(formData, "id"), expectedRevision: value(formData, "expectedRevision") || "0",
      intent: value(formData, "intent"), title: value(formData, "title"), slug: value(formData, "slug"),
      summary: value(formData, "summary"), roleOrContribution: value(formData, "roleOrContribution"),
      startDate: value(formData, "startDate"), endDate: value(formData, "endDate"),
      bodyMarkdown: value(formData, "bodyMarkdown"), seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"), isFeatured: checkbox(formData, "isFeatured"),
      featuredOrder: nullableNumber(value(formData, "featuredOrder")), sortOrder: value(formData, "sortOrder") || "0",
      categoryIds: unique(formStrings(formData, "categoryIds")), technologyIds: unique(formStrings(formData, "technologyIds")),
      coverMediaId: value(formData, "coverMediaId"), galleryMediaIds: unique(formStrings(formData, "galleryMediaIds")),
      links: parseLinks(value(formData, "links")) });
    result = await service().saveProject(input);
  } catch (error) { return actionError(error); }
  refresh("projects", input.slug);
  redirect(`/admin/projects?edit=${result.id}&notice=${result.status}`);
}

export async function saveResearchAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let result: Awaited<ReturnType<AdminContentService["saveResearch"]>>;
  let input;
  try {
    input = researchInputSchema.parse({ id: value(formData, "id"), expectedRevision: value(formData, "expectedRevision") || "0",
      intent: value(formData, "intent"), title: value(formData, "title"), slug: value(formData, "slug"),
      summary: value(formData, "summary"), researchType: value(formData, "researchType"),
      researchStage: value(formData, "researchStage"), roleOrContribution: value(formData, "roleOrContribution"),
      researchDate: value(formData, "researchDate"), academicPublishedDate: value(formData, "academicPublishedDate"),
      institution: value(formData, "institution"), venue: value(formData, "venue"), citationText: value(formData, "citationText"),
      doi: value(formData, "doi"), bodyMarkdown: value(formData, "bodyMarkdown"), seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"), isFeatured: checkbox(formData, "isFeatured"),
      featuredOrder: nullableNumber(value(formData, "featuredOrder")), sortOrder: value(formData, "sortOrder") || "0",
      technologyIds: unique(formStrings(formData, "technologyIds")), coverMediaId: value(formData, "coverMediaId"),
      figureMediaIds: unique(formStrings(formData, "figureMediaIds")), links: parseLinks(value(formData, "links")) });
    result = await service().saveResearch(input);
  } catch (error) { return actionError(error); }
  refresh("research", input.slug);
  redirect(`/admin/research?edit=${result.id}&notice=${result.status}`);
}

export async function saveThoughtAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let result: Awaited<ReturnType<AdminContentService["saveThought"]>>;
  let input;
  try {
    input = thoughtInputSchema.parse({ id: value(formData, "id"), expectedRevision: value(formData, "expectedRevision") || "0",
      intent: value(formData, "intent"), title: value(formData, "title"), slug: value(formData, "slug"),
      excerpt: value(formData, "excerpt"), category: value(formData, "category"),
      bodyMarkdown: value(formData, "bodyMarkdown"), seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"), coverMediaId: value(formData, "coverMediaId"),
      references: parseLinks(value(formData, "references")) });
    result = await service().saveThought(input);
  } catch (error) { return actionError(error); }
  refresh("thoughts", input.slug);
  redirect(`/admin/thoughts?edit=${result.id}&notice=${result.status}`);
}

export async function lifecycleAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let input;
  try {
    input = lifecycleInputSchema.parse({ type: value(formData, "type"), id: value(formData, "id"),
      expectedRevision: value(formData, "expectedRevision"), operation: value(formData, "operation") });
    await service().lifecycle(input);
  } catch (error) { return actionError(error); }
  const route = input.type === "project" ? "projects" : input.type === "research" ? "research" : "thoughts";
  refresh(route);
  redirect(`/admin/${route}?notice=${input.operation}`);
}

export async function saveExperienceAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let result;
  try {
    const input = experienceInputSchema.parse({ id: value(formData, "id"),
      expectedUpdatedAt: value(formData, "expectedUpdatedAt") || null,
      roleTitle: value(formData, "roleTitle"), organizationName: value(formData, "organizationName"),
      contextLabel: value(formData, "contextLabel"), startDate: value(formData, "startDate"),
      endDate: value(formData, "endDate"), isCurrent: checkbox(formData, "isCurrent"),
      description: value(formData, "description"), location: value(formData, "location"),
      organizationUrl: value(formData, "organizationUrl"), sortOrder: value(formData, "sortOrder") || "0",
      isVisible: checkbox(formData, "isVisible"), isFeatured: checkbox(formData, "isFeatured") });
    result = await service().saveExperience(input);
  } catch (error) { return actionError(error); }
  refresh("experience");
  redirect(`/admin/experience?edit=${result.id}&notice=saved`);
}

export async function saveCredentialAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let result;
  try {
    const input = credentialInputSchema.parse({ id: value(formData, "id"),
      expectedUpdatedAt: value(formData, "expectedUpdatedAt") || null,
      title: value(formData, "title"), issuerName: value(formData, "issuerName"),
      credentialType: value(formData, "credentialType"), issueDate: value(formData, "issueDate"),
      expiryDate: value(formData, "expiryDate"), publicIdentifier: value(formData, "publicIdentifier"),
      description: value(formData, "description"), verificationUrl: value(formData, "verificationUrl"),
      previewMediaId: value(formData, "previewMediaId"), sortOrder: value(formData, "sortOrder") || "0",
      isVisible: checkbox(formData, "isVisible") });
    result = await service().saveCredential(input);
  } catch (error) { return actionError(error); }
  refresh("credentials");
  redirect(`/admin/credentials?edit=${result.id}&notice=saved`);
}

export async function deleteCollectionAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let input;
  try {
    input = deleteCollectionInputSchema.parse({ type: value(formData, "type"), id: value(formData, "id"),
      expectedUpdatedAt: value(formData, "expectedUpdatedAt") });
    await service().deleteCollection(input.type, input.id, input.expectedUpdatedAt);
  } catch (error) { return actionError(error); }
  refresh(input.type === "experience" ? "experience" : "credentials");
  redirect(`/admin/${input.type === "experience" ? "experience" : "credentials"}?notice=deleted`);
}

export async function addTaxonomyAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let input;
  try {
    input = taxonomyInputSchema.parse({ kind: value(formData, "kind"), name: value(formData, "name"), returnTo: value(formData, "returnTo") });
    await service().addTaxonomy(input.kind, input.name);
  } catch (error) { return actionError(error); }
  revalidatePath(`/admin/${input.returnTo}`);
  redirect(`/admin/${input.returnTo}?notice=taxonomy-saved`);
}

function refreshTaxonomy(kind: "category" | "technology") {
  updateTag(publicContentTags.projects);
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/projects");
  if (kind === "technology") {
    updateTag(publicContentTags.research);
    revalidatePath("/research");
    revalidatePath("/admin/research");
  }
  revalidatePath("/admin/master-data");
}

export async function saveTaxonomyAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let kind: "category" | "technology";
  try {
    const input = masterTaxonomyInputSchema.parse({
      kind: value(formData, "kind"), id: value(formData, "id"),
      expectedUpdatedAt: value(formData, "expectedUpdatedAt") || null,
      name: value(formData, "name"), key: value(formData, "key"),
      description: value(formData, "description"), referenceUrl: value(formData, "referenceUrl"),
      iconKey: value(formData, "iconKey"), sortOrder: value(formData, "sortOrder") || "0",
    });
    kind = input.kind;
    await service().saveTaxonomy(input);
  } catch (error) { return actionError(error); }
  refreshTaxonomy(kind);
  redirect("/admin/master-data?notice=taxonomy-saved");
}

export async function deleteTaxonomyAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let kind: "category" | "technology";
  try {
    const input = deleteTaxonomyInputSchema.parse({ kind: value(formData, "kind"), id: value(formData, "id"),
      expectedUpdatedAt: value(formData, "expectedUpdatedAt") });
    kind = input.kind;
    await service().deleteTaxonomy(input.kind, input.id, input.expectedUpdatedAt);
  } catch (error) { return actionError(error); }
  refreshTaxonomy(kind);
  redirect("/admin/master-data?notice=taxonomy-deleted");
}
