import { z } from "zod";
import type { CmsCollection } from "./cms-firestore";

const short = z.string().trim().min(1).max(240);
const text = z.string().trim().max(10_000);
const url = z.url().refine(value => value.startsWith("https://"));
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const link = z.tuple([short, url]);

const project = z.object({
  slug: slug.optional(), title: short, category: short, subtitle: short, role: short,
  team: short, surface: short, visual: url, alt: short, caption: short,
  external: url.optional(), sections: z.array(z.tuple([short, text])).min(1).max(20),
  order: z.number().int().min(0).max(1000),
}).passthrough();
const experience = z.object({
  name: short, role: short, date: short, image: url, text,
  links: z.array(link).max(10), order: z.number().int().min(0).max(1000),
  status: z.enum(["published", "draft"]).optional(),
}).passthrough();
const credential = z.object({
  title: short, issuer: short, href: z.union([url, z.literal("")]), group: short,
  order: z.number().int().min(0).max(1000), status: z.enum(["published", "draft"]).optional(),
}).passthrough();
const education = z.object({
  institution: short, program: short, degree: short, focus: z.array(short).max(10),
  startYear: z.number().int().min(1900).max(2100), endYear: z.number().int().min(1900).max(2100),
  gpa: z.string().regex(/^\d(?:\.\d{1,2})?$/), order: z.number().int().min(0).max(1000),
  status: z.enum(["published", "draft"]).optional(),
}).passthrough();
const thought = z.object({
  slug: slug.optional(), title: short, summary: short, coverUrl: url.optional(),
  bodyMarkdown: z.string().max(100_000),
}).passthrough();
const research = z.object({
  slug: slug.optional(), title: short, category: short, summary: short,
  rows: z.array(z.tuple([short, text])).min(1).max(30),
}).passthrough();
const siteSettings = z.object({
  name: short, role: short, headline: short, email: z.email(),
  linkedin: url, instagram: url, portraitUrl: url, brandMarkUrl: url,
  completedProjectsCount: z.number().int().min(0).max(999),
  teamsAndClientsCount: z.number().int().min(0).max(999),
}).passthrough();
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
function luminance(value: string) {
  const channels = [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
const themeMode = z.object({background: color, foreground: color, accent: color}).superRefine((mode, context) => {
  const a = luminance(mode.background), b = luminance(mode.foreground);
  if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 4.5) {
    context.addIssue({code: "custom", message: "Text and background need at least 4.5:1 contrast."});
  }
});
const theme = z.object({
  light: themeMode, dark: themeMode,
}).passthrough();
const homePage = z.object({
  headline: short, workHeading: short, experienceHeading: short, learningHeading: short,
  learning: z.array(z.object({label: short, title: short, body: text})).max(12),
  nextUp: z.object({title: short, body: text}),
}).passthrough();
const taxonomy = z.object({name: short, slug, order: z.number().int().min(0).max(1000)}).passthrough();
const social = z.object({label: short, href: url, order: z.number().int().min(0).max(1000)}).passthrough();

export function validateCmsPayload(collection: CmsCollection, id: string, payload: Record<string, unknown>) {
  const schema = collection === "projects" ? project : collection === "experiences" ? experience :
    collection === "education" ? education : collection === "credentials" ? credential :
    collection === "thoughts" ? thought : collection === "research" ? research :
    collection === "site" ? id === "theme" ? theme : siteSettings :
    collection === "pages" ? id === "homepage" ? homePage : z.object({title: short}).passthrough() :
    collection === "socialLinks" ? social : taxonomy;
  const result = schema.safeParse(payload);
  if (!result.success) {
    const field = result.error.issues[0]?.path.join(".") || "document";
    throw new Error(`Check ${field}: ${collection === "site" && id === "theme" ? result.error.issues[0]?.message : "the value is missing or has the wrong format."}`);
  }
  return result.data;
}
