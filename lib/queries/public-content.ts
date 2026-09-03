import "server-only";

import { cache } from "react";
import type { Database } from "../database/connection";
import { getDatabase } from "../database/client";
import { PublicContentRepository } from "../repositories/public-content";

export function createPublicContentQueries(db: Database) {
  const repository = new PublicContentRepository(db);
  const latestLimit = (value: number) => Number.isFinite(value) ? Math.min(20, Math.max(1, Math.trunc(value))) : 3;
  return {
    getSiteSettings: () => repository.getSiteSettings(),
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

// React cache only deduplicates a server render; it is not persistent content caching.
export const getSiteSettings = cache(() => queries().getSiteSettings());
export const getThemeSettings = cache(() => queries().getThemeSettings());
export const getProfile = cache(() => queries().getProfile());
export const getFeaturedProjects = cache(() => queries().getFeaturedProjects());
export const getPublishedProjects = cache(() => queries().getPublishedProjects());
export const getProjectBySlug = cache((slug: string) => queries().getProjectBySlug(slug));
export const getExperiences = cache(() => queries().getExperiences());
export const getExperienceHighlight = cache(() => queries().getExperienceHighlight());
export const getPublishedResearch = cache(() => queries().getPublishedResearch());
export const getFeaturedResearch = cache(() => queries().getFeaturedResearch());
export const getResearchBySlug = cache((slug: string) => queries().getResearchBySlug(slug));
export const getLatestThoughts = cache((limit = 3) => queries().getLatestThoughts(limit));
export const getPublishedThoughts = cache(() => queries().getPublishedThoughts());
export const getThoughtBySlug = cache((slug: string) => queries().getThoughtBySlug(slug));
export const getCredentials = cache(() => queries().getCredentials());
