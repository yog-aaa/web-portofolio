import { z } from "zod";
import { defaultThemeColors } from "../domain/settings";
import { socialIconOptions } from "../domain/social-icons";

const optionalText = (maximum: number) => z.string().trim().max(maximum).transform((value) => value || null);
const requiredText = (label: string, maximum: number) => z.string().trim().min(1, `${label} is required.`).max(maximum);
const hex = z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex color such as #526D82.")
  .transform((value) => value.toUpperCase());
const optionalUuid = z.string().trim().transform((value) => value || null).pipe(z.string().uuid().nullable());
const socialIconKeys = socialIconOptions.map((option) => option.key) as [
  (typeof socialIconOptions)[number]["key"],
  ...(typeof socialIconOptions)[number]["key"][],
];

export const siteSettingsInputSchema = z.object({
  expectedUpdatedAt: z.string().datetime().nullable(),
  profileDisplayName: requiredText("Profile name", 120),
  location: optionalText(240),
  portraitMediaId: optionalUuid,
  brandName: requiredText("Brand display", 120),
  siteTitle: optionalText(160),
  defaultSeoDescription: optionalText(320),
  contentLanguage: z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Use a language code such as en or id-ID."),
  heroEyebrow: optionalText(160),
  heroHeadline: optionalText(300),
  heroDescription: optionalText(1_000),
  heroExploreLabel: optionalText(120),
  contactHeading: optionalText(300),
  contactLabel: optionalText(120),
  contactText: optionalText(1_000),
  contactEmail: z.string().trim().max(254).refine((value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address.").transform((value) => value ? value.toLowerCase() : null),
  footerContent: optionalText(500),
  sectionCopy: z.object({
    selectedWork: z.object({ heading: optionalText(160), intro: optionalText(500), actionLabel: optionalText(120) }),
    experienceHighlight: z.object({ heading: optionalText(160), intro: optionalText(500), actionLabel: optionalText(120) }),
    featuredResearch: z.object({ heading: optionalText(160), intro: optionalText(500), actionLabel: optionalText(120) }),
    latestThoughts: z.object({ heading: optionalText(160), intro: optionalText(500), actionLabel: optionalText(120) }),
    shortAbout: z.object({ heading: optionalText(160), intro: optionalText(500), actionLabel: optionalText(120) }),
    contact: z.object({ heading: optionalText(160) }),
  }).strict(),
  socialLinks: z.array(z.object({
    label: requiredText("Social link label", 120),
    destination: z.string().trim().url().startsWith("https://", "Social links must use HTTPS.").max(2048),
    platformKey: z.enum(socialIconKeys),
  }).strict()).max(20),
}).strict();

function luminance(hexColor: string) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hexColor.slice(start, start + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string) {
  const [bright, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
}

export const themeSettingsInputSchema = z.object({
  intent: z.enum(["save", "reset"]),
  expectedUpdatedAt: z.string().datetime().nullable(),
  background: hex.default(defaultThemeColors.background),
  surface: hex.default(defaultThemeColors.surface),
  foreground: hex.default(defaultThemeColors.foreground),
  border: hex.default(defaultThemeColors.border),
  accent: hex.default(defaultThemeColors.accent),
  accentSecondary: hex.default(defaultThemeColors.accentSecondary),
  accentForeground: hex.default(defaultThemeColors.accentForeground),
  accentSoft: hex.default(defaultThemeColors.accentSoft),
}).strict().superRefine((value, context) => {
  if (value.intent === "reset") return;
  for (const [path, first, second] of [
    ["foreground", value.foreground, value.background],
    ["foreground", value.foreground, value.surface],
    ["accentForeground", value.accentForeground, value.accent],
    ["foreground", value.foreground, value.accentSoft],
  ] as const) {
    if (contrast(first, second) < 4.5) context.addIssue({ code: "custom", path: [path],
      message: "Text and background colors must meet WCAG AA contrast (4.5:1)." });
  }
  if (contrast(value.accent, value.background) < 4.5 || contrast(value.accent, value.surface) < 4.5) {
    context.addIssue({ code: "custom", path: ["accent"],
      message: "Accent text must meet WCAG AA contrast against background and surface colors (4.5:1)." });
  }
  if (contrast(value.accentSecondary, value.background) < 3 || contrast(value.accentSecondary, value.surface) < 3) {
    context.addIssue({ code: "custom", path: ["accentSecondary"],
      message: "The secondary accent must remain distinguishable from background and surface colors (3:1)." });
  }
});

export type SiteSettingsInput = z.output<typeof siteSettingsInputSchema>;
export type ThemeSettingsInput = z.output<typeof themeSettingsInputSchema>;
