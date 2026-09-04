import type { SectionCopy } from "./content-values";
import type { SocialIconKey } from "./social-icons";

export type AdminSocialLink = {
  id: string;
  label: string;
  destination: string;
  platformKey: SocialIconKey | null;
  sortOrder: number;
};

export type AdminSiteSettings = {
  profileDisplayName: string;
  location: string | null;
  portraitMediaId: string | null;
  brandName: string;
  siteTitle: string | null;
  defaultSeoDescription: string | null;
  contentLanguage: string | null;
  heroEyebrow: string | null;
  heroHeadline: string | null;
  heroDescription: string | null;
  heroExploreLabel: string | null;
  contactHeading: string | null;
  contactLabel: string | null;
  contactText: string | null;
  contactEmail: string | null;
  footerContent: string | null;
  sectionCopy: SectionCopy;
  socialLinks: AdminSocialLink[];
  updatedAt: string | null;
};

export const defaultThemeColors = {
  background: "#F7F9FC",
  surface: "#FFFFFF",
  foreground: "#172033",
  border: "#D9E2EC",
  accent: "#526D82",
  accentSecondary: "#6E8CA6",
  accentForeground: "#FFFFFF",
  accentSoft: "#DDEAF3",
} as const;

export type ThemeColorKey = keyof typeof defaultThemeColors;
export type AdminThemeSettings = Record<ThemeColorKey, string | null> & { updatedAt: string | null };
