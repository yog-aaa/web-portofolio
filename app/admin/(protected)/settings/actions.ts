"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSettingsService } from "@/lib/services/admin-settings-server";
import { publicContentTags } from "@/lib/queries/content-cache";
import { actionError, type AdminActionState } from "@/lib/validation/admin-content";
import { siteSettingsInputSchema, themeSettingsInputSchema } from "@/lib/validation/settings";
import { inferSocialIconKey } from "@/lib/domain/social-icons";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
const nullable = (form: FormData, name: string) => value(form, name) || null;

function socialLinks(form: FormData) {
  const labels = form.getAll("socialLabel").map(String);
  const destinations = form.getAll("socialDestination").map(String);
  const icons = form.getAll("socialIcon").map(String);
  return labels.map((label, index) => ({
    label,
    destination: destinations[index] ?? "",
    platformKey: icons[index] || inferSocialIconKey(label, destinations[index] ?? ""),
  }));
}

function refreshPublic() {
  updateTag(publicContentTags.site);
  updateTag(publicContentTags.profile);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function saveSiteSettingsAction(_state: AdminActionState, form: FormData): Promise<AdminActionState> {
  try {
    const section = (key: string) => ({ heading: value(form, `${key}Heading`),
      intro: value(form, `${key}Intro`), actionLabel: value(form, `${key}ActionLabel`) });
    const input = siteSettingsInputSchema.parse({
      expectedUpdatedAt: nullable(form, "expectedUpdatedAt"),
      profileDisplayName: value(form, "profileDisplayName"), location: value(form, "location"),
      portraitMediaId: value(form, "portraitMediaId"),
      brandName: value(form, "brandName"), siteTitle: value(form, "siteTitle"),
      defaultSeoDescription: value(form, "defaultSeoDescription"), contentLanguage: value(form, "contentLanguage"),
      heroEyebrow: value(form, "heroEyebrow"), heroHeadline: value(form, "heroHeadline"),
      heroDescription: value(form, "heroDescription"), heroExploreLabel: value(form, "heroExploreLabel"),
      contactHeading: value(form, "contactHeading"), contactLabel: value(form, "contactLabel"),
      contactText: value(form, "contactText"), contactEmail: value(form, "contactEmail"),
      footerContent: value(form, "footerContent"), socialLinks: socialLinks(form),
      sectionCopy: { selectedWork: section("selectedWork"), experienceHighlight: section("experienceHighlight"),
        featuredResearch: section("featuredResearch"), latestThoughts: section("latestThoughts"),
        shortAbout: section("shortAbout"), contact: { heading: value(form, "contactSectionHeading") } },
    });
    await getAdminSettingsService().saveSite(input);
  } catch (error) { return actionError(error); }
  refreshPublic();
  redirect("/admin/settings?notice=saved");
}

export async function saveThemeSettingsAction(_state: AdminActionState, form: FormData): Promise<AdminActionState> {
  try {
    const input = themeSettingsInputSchema.parse({ intent: value(form, "intent"),
      expectedUpdatedAt: nullable(form, "expectedUpdatedAt"), background: value(form, "background") || undefined,
      surface: value(form, "surface") || undefined, foreground: value(form, "foreground") || undefined,
      border: value(form, "border") || undefined, accent: value(form, "accent") || undefined,
      accentSecondary: value(form, "accentSecondary") || undefined,
      accentForeground: value(form, "accentForeground") || undefined, accentSoft: value(form, "accentSoft") || undefined });
    await getAdminSettingsService().saveTheme(input);
  } catch (error) { return actionError(error); }
  updateTag(publicContentTags.theme);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/theme");
  redirect(`/admin/settings/theme?notice=${value(form, "intent") === "reset" ? "theme-reset" : "saved"}`);
}
