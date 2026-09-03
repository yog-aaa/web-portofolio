/** Partial calendar date supplied by the owner: YYYY, YYYY-MM, or YYYY-MM-DD. */
export type PreciseDate = string;
export type ContentLink = { label: string; url: string };
export type CollaboratorCredit = { name: string; role?: string; url?: string };

export type HomeSectionKey =
  | "hero" | "selectedWork" | "experienceHighlight" | "featuredResearch"
  | "latestThoughts" | "shortAbout" | "contact" | "footer";
export type SectionCopy = Partial<Record<HomeSectionKey, {
  heading?: string; intro?: string; actionLabel?: string;
}>>;

/** Complete private editing payload, not a public read model. References use slot-aware joins. */
export interface EditorialDraft {
  version: 1;
  title: string;
  slug?: string | null;
  bodyMarkdown?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface ProjectDraft extends EditorialDraft {
  summary?: string | null;
  roleOrContribution?: string | null;
  startDate?: PreciseDate | null;
  endDate?: PreciseDate | null;
  collaborators?: CollaboratorCredit[];
  links?: ContentLink[];
  isFeatured?: boolean;
  featuredOrder?: number | null;
  sortOrder?: number;
}

export interface ResearchDraft extends EditorialDraft {
  summary?: string | null;
  researchType?: string | null;
  researchStage?: string | null;
  roleOrContribution?: string | null;
  researchDate?: PreciseDate | null;
  academicPublishedDate?: PreciseDate | null;
  institution?: string | null;
  venue?: string | null;
  citationText?: string | null;
  doi?: string | null;
  collaborators?: CollaboratorCredit[];
  links?: ContentLink[];
  isFeatured?: boolean;
  featuredOrder?: number | null;
  sortOrder?: number;
}

export interface ThoughtDraft extends EditorialDraft {
  excerpt?: string | null;
  references?: ContentLink[];
}
