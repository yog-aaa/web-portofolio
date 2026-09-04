import "server-only";

import { and, asc, eq } from "drizzle-orm";
import type { Database } from "../database/connection";
import { mediaAssets } from "../database/schema/media";
import { profile, siteSettings, socialLinks, themeSettings } from "../database/schema/site";
import type { SectionCopy } from "../domain/content-values";
import type { AdminSiteSettings, AdminThemeSettings } from "../domain/settings";
import type { SiteSettingsInput, ThemeSettingsInput } from "../validation/settings";
import { isSocialIconKey } from "../domain/social-icons";

export class AdminSettingsRepository {
  constructor(private readonly db: Database) {}

  async site(): Promise<AdminSiteSettings | null> {
    const [row] = await this.db.select({
      profileDisplayName: profile.displayName, location: profile.location, portraitMediaId: profile.portraitMediaId,
      brandName: siteSettings.brandName, siteTitle: siteSettings.siteTitle,
      defaultSeoDescription: siteSettings.defaultSeoDescription, contentLanguage: siteSettings.contentLanguage,
      heroEyebrow: siteSettings.heroSupportingCopy, heroHeadline: siteSettings.heroHeadline,
      heroDescription: siteSettings.heroIntro, heroExploreLabel: siteSettings.heroExploreLabel,
      contactHeading: siteSettings.contactCtaHeading, contactLabel: siteSettings.contactCtaLabel,
      contactText: siteSettings.contactSupportingCopy, footerContent: siteSettings.footerCopy,
      sectionCopy: siteSettings.sectionCopy, updatedAt: siteSettings.updatedAt,
    }).from(siteSettings).innerJoin(profile, eq(siteSettings.profileId, profile.id)).where(eq(siteSettings.id, 1));
    if (!row) return null;
    const links = await this.db.select().from(socialLinks).where(eq(socialLinks.profileId, 1))
      .orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id));
    const contact = links.find((item) => item.purpose === "contact" && item.destination.startsWith("mailto:"));
    return { ...row, updatedAt: row.updatedAt.toISOString(), contactEmail: contact?.destination.slice(7) ?? null,
      socialLinks: links.filter((item) => item.purpose === "social").map((item) => ({ id: item.id,
        label: item.label, destination: item.destination,
        platformKey: isSocialIconKey(item.platformKey) ? item.platformKey : null, sortOrder: item.sortOrder })) };
  }

  async theme(): Promise<AdminThemeSettings | null> {
    const [row] = await this.db.select().from(themeSettings).where(eq(themeSettings.id, 1));
    return row ? { background: row.background, surface: row.surface, foreground: row.foreground,
      border: row.border, accent: row.accent, accentSecondary: row.accentSecondary,
      accentForeground: row.accentForeground, accentSoft: row.accentSoft,
      updatedAt: row.updatedAt.toISOString() } : null;
  }

  async saveSite(input: SiteSettingsInput) {
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(siteSettings).where(eq(siteSettings.id, 1)).for("update");
      if (current && (!input.expectedUpdatedAt || current.updatedAt.toISOString() !== input.expectedUpdatedAt)) {
        throw new Error("SETTINGS_STALE");
      }
      if (input.portraitMediaId) {
        const [portrait] = await tx.select({ id: mediaAssets.id, altText: mediaAssets.altText })
          .from(mediaAssets).where(and(eq(mediaAssets.id, input.portraitMediaId), eq(mediaAssets.category, "profile"),
            eq(mediaAssets.kind, "image"), eq(mediaAssets.access, "public"), eq(mediaAssets.availability, "ready")));
        if (!portrait?.altText?.trim()) throw new Error("SETTINGS_PORTRAIT_INVALID");
      }
      await tx.insert(profile).values({ id: 1, displayName: input.profileDisplayName, location: input.location,
        portraitMediaId: input.portraitMediaId })
        .onConflictDoUpdate({ target: profile.id, set: { displayName: input.profileDisplayName,
          location: input.location, portraitMediaId: input.portraitMediaId, updatedAt: new Date() } });
      await tx.insert(themeSettings).values({ id: 1 }).onConflictDoNothing();
      if (current) await tx.update(siteSettings).set({ primaryContactLinkId: null }).where(eq(siteSettings.id, 1));
      await tx.delete(socialLinks).where(eq(socialLinks.profileId, 1));
      let contactId: string | null = null;
      if (input.contactEmail) {
        const [contact] = await tx.insert(socialLinks).values({ profileId: 1, label: "Email",
          destination: `mailto:${input.contactEmail}`, purpose: "contact", platformKey: "email",
          isVisible: true, sortOrder: 0 }).returning({ id: socialLinks.id });
        contactId = contact.id;
      }
      if (input.socialLinks.length) await tx.insert(socialLinks).values(input.socialLinks.map((item, index) => ({
        profileId: 1, label: item.label, destination: item.destination, purpose: "social" as const,
        platformKey: item.platformKey, isVisible: true, sortOrder: index + 1,
      })));
      const sectionCopy = Object.fromEntries(Object.entries(input.sectionCopy).map(([key, value]) => [key, {
        ...(value.heading ? { heading: value.heading } : {}),
        ...("intro" in value && value.intro ? { intro: value.intro } : {}),
        ...("actionLabel" in value && value.actionLabel ? { actionLabel: value.actionLabel } : {}),
      }])) as SectionCopy;
      const updatedAt = new Date(Math.max(Date.now(), (current?.updatedAt.getTime() ?? 0) + 1));
      const values = { profileId: 1, themeSettingsId: 1, brandName: input.brandName,
        siteTitle: input.siteTitle, defaultSeoDescription: input.defaultSeoDescription,
        contentLanguage: input.contentLanguage, heroSupportingCopy: input.heroEyebrow,
        heroHeadline: input.heroHeadline, heroIntro: input.heroDescription,
        heroExploreLabel: input.heroExploreLabel, contactCtaHeading: input.contactHeading,
        contactCtaLabel: input.contactLabel, contactSupportingCopy: input.contactText,
        footerCopy: input.footerContent, sectionCopy, primaryContactLinkId: contactId, updatedAt };
      if (current) await tx.update(siteSettings).set(values).where(eq(siteSettings.id, 1));
      else await tx.insert(siteSettings).values({ id: 1, ...values });
      return { saved: true as const };
    });
  }

  async saveTheme(input: ThemeSettingsInput) {
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(themeSettings).where(eq(themeSettings.id, 1)).for("update");
      if (current && (!input.expectedUpdatedAt || current.updatedAt.toISOString() !== input.expectedUpdatedAt)) {
        throw new Error("SETTINGS_STALE");
      }
      const colors = input.intent === "reset" ? { background: null, surface: null, foreground: null,
        border: null, accent: null, accentSecondary: null, accentForeground: null, accentSoft: null }
        : { background: input.background, surface: input.surface, foreground: input.foreground,
          border: input.border, accent: input.accent, accentSecondary: input.accentSecondary,
          accentForeground: input.accentForeground, accentSoft: input.accentSoft };
      const updatedAt = new Date(Math.max(Date.now(), (current?.updatedAt.getTime() ?? 0) + 1));
      await tx.insert(themeSettings).values({ id: 1, ...colors, updatedAt }).onConflictDoUpdate({ target: themeSettings.id,
        set: { ...colors, updatedAt } });
      return { saved: true as const };
    });
  }
}
