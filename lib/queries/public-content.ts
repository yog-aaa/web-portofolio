import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Database } from "../database/connection";
import { getDatabase } from "../database/client";
import { PublicContentRepository } from "../repositories/public-content";
import type { PublicPageRoute } from "../domain/content";
import { publicContentTags } from "./content-cache";

const PUBLIC_CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;
const latestLimit = (value: number) => Number.isFinite(value) ? Math.min(20, Math.max(1, Math.trunc(value))) : 3;

export function createPublicContentQueries(db: Database) {
  const repository = new PublicContentRepository(db);
  return {
    getSiteSettings: () => repository.getSiteSettings(),
    getPageSettings: (route: PublicPageRoute) => repository.getPageSettings(route),
    getThemeSettings: () => repository.getThemeSettings(),
    getProfile: () => repository.getProfile(),
    getFeaturedProjects: () => repository.getFeaturedProjects(),
    getPublishedProjects: () => repository.getPublishedProjects(),
    getProjectBySlug: (slug: string) => repository.getProjectBySlug(slug),
    getExperiences: () => repository.getExperiences(),
    getExperienceHighlight: () => repository.getExperienceHighlight(),
    getPublishedResearch: () => repository.getPublishedResearch(),
    getFeaturedResearch: () => repository.getFeaturedResearch(),
    getResearchBySlug: (slug: string) => repository.getResearchBySlug(slug),
    getLatestThoughts: (limit = 3) => repository.getLatestThoughts(latestLimit(limit)),
    getPublishedThoughts: () => repository.getPublishedThoughts(),
    getThoughtBySlug: (slug: string) => repository.getThoughtBySlug(slug),
    getCredentials: () => repository.getCredentials(),
  };
}

function queries() { return createPublicContentQueries(getDatabase()); }

const persistent = {
  site: unstable_cache(() => queries().getSiteSettings(), ["public-site-settings-v1"],
    { tags: [publicContentTags.site], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  page: unstable_cache((route: PublicPageRoute) => queries().getPageSettings(route), ["public-page-settings-v1"],
    { tags: [publicContentTags.pages], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  theme: unstable_cache(() => queries().getThemeSettings(), ["public-theme-settings-v1"],
    { tags: [publicContentTags.theme], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  profile: unstable_cache(() => queries().getProfile(), ["public-profile-v1"],
    { tags: [publicContentTags.profile], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  featuredProjects: unstable_cache(() => queries().getFeaturedProjects(), ["public-featured-projects-v1"],
    { tags: [publicContentTags.projects], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  projects: unstable_cache(() => queries().getPublishedProjects(), ["public-projects-v1"],
    { tags: [publicContentTags.projects], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  project: unstable_cache((slug: string) => queries().getProjectBySlug(slug), ["public-project-by-slug-v1"],
    { tags: [publicContentTags.projects], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  experiences: unstable_cache(() => queries().getExperiences(), ["public-experiences-v1"],
    { tags: [publicContentTags.experience], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  experienceHighlight: unstable_cache(() => queries().getExperienceHighlight(), ["public-experience-highlight-v1"],
    { tags: [publicContentTags.experience], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  research: unstable_cache(() => queries().getPublishedResearch(), ["public-research-v1"],
    { tags: [publicContentTags.research], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  featuredResearch: unstable_cache(() => queries().getFeaturedResearch(), ["public-featured-research-v1"],
    { tags: [publicContentTags.research], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  researchItem: unstable_cache((slug: string) => queries().getResearchBySlug(slug), ["public-research-by-slug-v1"],
    { tags: [publicContentTags.research], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  latestThoughts: unstable_cache((limit: number) => queries().getLatestThoughts(limit), ["public-latest-thoughts-v1"],
    { tags: [publicContentTags.thoughts], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  thoughts: unstable_cache(() => queries().getPublishedThoughts(), ["public-thoughts-v1"],
    { tags: [publicContentTags.thoughts], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  thought: unstable_cache((slug: string) => queries().getThoughtBySlug(slug), ["public-thought-by-slug-v1"],
    { tags: [publicContentTags.thoughts], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
  credentials: unstable_cache(() => queries().getCredentials(), ["public-credentials-v1"],
    { tags: [publicContentTags.credentials], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS }),
};

// React cache deduplicates within a render; Next's Data Cache serves unchanged CMS data across requests.
export const getSiteSettings = cache(persistent.site);
export const getPageSettings = cache(persistent.page);
export const getThemeSettings = cache(persistent.theme);
export const getProfile = cache(persistent.profile);
export const getFeaturedProjects = cache(persistent.featuredProjects);
export const getPublishedProjects = cache(persistent.projects);
export const getProjectBySlug = cache(persistent.project);
export const getExperiences = cache(persistent.experiences);
export const getExperienceHighlight = cache(persistent.experienceHighlight);
export const getPublishedResearch = cache(persistent.research);
export const getFeaturedResearch = cache(persistent.featuredResearch);
export const getResearchBySlug = cache(persistent.researchItem);
export const getLatestThoughts = cache((limit = 3) => persistent.latestThoughts(latestLimit(limit)));
export const getPublishedThoughts = cache(persistent.thoughts);
export const getThoughtBySlug = cache(persistent.thought);
export const getCredentials = cache(persistent.credentials);
