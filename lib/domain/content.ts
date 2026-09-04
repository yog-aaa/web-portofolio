import type { CollaboratorCredit, ContentLink, PreciseDate, SectionCopy } from "./content-values";
import type { MediaImageData } from "./media";

export type PublicSiteSettings = {
  brandName: string;
  siteTitle: string | null;
  defaultSeoDescription: string | null;
  contentLanguage: string | null;
  heroHeadline: string | null;
  heroIntro: string | null;
  heroExploreLabel: string | null;
  heroSupportingCopy: string | null;
  contactCtaHeading: string | null;
  contactCtaLabel: string | null;
  contactSupportingCopy: string | null;
  footerCopy: string | null;
  sectionCopy: SectionCopy;
  defaultSocialImage: MediaImageData | null;
};

export type PublicThemeSettings = {
  background: string | null;
  surface: string | null;
  foreground: string | null;
  border: string | null;
  accent: string | null;
  accentForeground: string | null;
  accentSoft: string | null;
  accentSecondary: string | null;
};

export const publicPageRoutes = [
  "/",
  "/work",
  "/experience",
  "/research",
  "/thoughts",
  "/about",
  "/credentials",
] as const;

export type PublicPageRoute = (typeof publicPageRoutes)[number];

export type PublicPageSettings = {
  route: PublicPageRoute;
  intro: string | null;
  emptyStateCopy: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: MediaImageData | null;
};

export type PublicEducation = {
  id: string;
  institutionName: string;
  qualificationOrProgram: string;
  fieldOfStudy: string | null;
  startDate: PreciseDate | null;
  endDate: PreciseDate | null;
  isCurrent: boolean | null;
  description: string | null;
  institutionUrl: string | null;
  gpaValue: string | null;
  gpaScale: string | null;
  institutionImage: MediaImageData | null;
};

export type PublicSocialLink = {
  id: string;
  label: string;
  destination: string;
  purpose: "social" | "contact";
  platformKey: string | null;
};

export type PublicProfile = {
  displayName: string;
  focusLine: string | null;
  shortBiography: string | null;
  biographyMarkdown: string | null;
  location: string | null;
  availabilityText: string | null;
  resumeUrl: string | null;
  portrait: MediaImageData | null;
  education: PublicEducation[];
  socialLinks: PublicSocialLink[];
};

export type PublicTaxonomy = { key: string; name: string };
export type PublicMediaReference = {
  id: string;
  role: "cover" | "gallery" | "figure" | "body" | "social";
  alt: string;
  caption: string | null;
  isDecorative: boolean;
  image: MediaImageData;
};

type PublicEditorialBase = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  publicUpdatedAt: string;
};

export type PublicProject = PublicEditorialBase & {
  summary: string;
  roleOrContribution: string;
  startDate: PreciseDate | null;
  endDate: PreciseDate | null;
  collaborators: CollaboratorCredit[];
  links: ContentLink[];
  categories: PublicTaxonomy[];
  technologies: PublicTaxonomy[];
  cover: PublicMediaReference | null;
};
export type PublicProjectDetail = PublicProject & {
  bodyMarkdown: string;
  seoTitle: string | null;
  seoDescription: string | null;
  media: PublicMediaReference[];
};

export type PublicResearch = PublicEditorialBase & {
  summary: string;
  researchType: string;
  researchStage: string | null;
  roleOrContribution: string;
  researchDate: PreciseDate | null;
  academicPublishedDate: PreciseDate | null;
  institution: string | null;
  venue: string | null;
  citationText: string | null;
  doi: string | null;
  collaborators: CollaboratorCredit[];
  links: ContentLink[];
  technologies: PublicTaxonomy[];
  cover: PublicMediaReference | null;
};
export type PublicResearchDetail = PublicResearch & {
  bodyMarkdown: string;
  seoTitle: string | null;
  seoDescription: string | null;
  media: PublicMediaReference[];
};

export type PublicThought = PublicEditorialBase & {
  excerpt: string;
  category: string | null;
  readingMinutes: number;
  cover: PublicMediaReference | null;
};
export type PublicThoughtDetail = PublicThought & {
  bodyMarkdown: string;
  seoTitle: string | null;
  seoDescription: string | null;
  references: ContentLink[];
  media: PublicMediaReference[];
};

export type PublicExperience = {
  id: string;
  roleTitle: string;
  organizationName: string;
  description: string;
  startDate: PreciseDate;
  endDate: PreciseDate | null;
  isCurrent: boolean;
  contextLabel: string | null;
  location: string | null;
  organizationUrl: string | null;
  organizationImage: MediaImageData | null;
};

export type PublicCredential = {
  id: string;
  title: string;
  issuerName: string;
  credentialType: string;
  issueDate: PreciseDate | null;
  expiryDate: PreciseDate | null;
  publicIdentifier: string | null;
  description: string | null;
  verificationUrl: string | null;
  previewImage: MediaImageData | null;
};
