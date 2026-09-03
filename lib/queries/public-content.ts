import "server-only";

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

export const getSiteSettings = () => queries().getSiteSettings();
export const getThemeSettings = () => queries().getThemeSettings();
export const getProfile = () => queries().getProfile();
export const getFeaturedProjects = () => queries().getFeaturedProjects();
export const getPublishedProjects = () => queries().getPublishedProjects();
export const getProjectBySlug = (slug: string) => queries().getProjectBySlug(slug);
export const getExperiences = () => queries().getExperiences();
export const getPublishedResearch = () => queries().getPublishedResearch();
export const getFeaturedResearch = () => queries().getFeaturedResearch();
export const getResearchBySlug = (slug: string) => queries().getResearchBySlug(slug);
export const getLatestThoughts = (limit = 3) => queries().getLatestThoughts(limit);
export const getPublishedThoughts = () => queries().getPublishedThoughts();
export const getThoughtBySlug = (slug: string) => queries().getThoughtBySlug(slug);
export const getCredentials = () => queries().getCredentials();
