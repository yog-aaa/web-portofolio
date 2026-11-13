import "server-only";

import { cache } from "react";
import { getServerFirestore } from "@/lib/firebase/admin";

export type PublicProject = {
  slug: string; title: string; category: string; subtitle: string; role: string;
  team: string; surface: string; visual: string; alt: string; caption: string;
  external?: string; sections: [string, string][]; order: number;
};
export type PublicExperience = {
  name: string; role: string; date: string; image: string; text: string;
  links: [string, string][]; order: number;
};
export type PublicCredential = { title: string; issuer: string; href: string; group: string; order: number };
export type PublicSite = {
  name: string; role: string; headline: string; portraitUrl: string; brandMarkUrl: string;
  linkedin: string; instagram: string; email: string;
  completedProjectsCount: number; teamsAndClientsCount: number;
};

const db = () => getServerFirestore();

export const getPublicProjects = cache(async (): Promise<PublicProject[]> => {
  const snapshot = await db().collection("projects").where("status", "==", "published").get();
  return snapshot.docs.map(doc => doc.data().published as PublicProject)
    .filter((item): item is PublicProject => Boolean(item?.slug))
    .sort((a, b) => a.order - b.order);
});

export const getPublicExperiences = cache(async (): Promise<PublicExperience[]> => {
  const snapshot = await db().collection("experiences").where("status", "==", "published").get();
  return snapshot.docs.map(doc => doc.data() as PublicExperience).sort((a, b) => a.order - b.order);
});

export const getPublicCredentials = cache(async (): Promise<PublicCredential[]> => {
  const snapshot = await db().collection("credentials").where("status", "==", "published").get();
  return snapshot.docs.map(doc => doc.data() as PublicCredential).sort((a, b) => a.order - b.order);
});

export const getPublicSite = cache(async (): Promise<PublicSite> => {
  const doc = await db().collection("site").doc("settings").get();
  if (!doc.exists) throw new Error("Porto V2 site settings have not been seeded.");
  return doc.data() as PublicSite;
});

export const getPublicEducation = cache(async () => {
  const snapshot = await db().collection("education").where("status", "==", "published").limit(10).get();
  return snapshot.docs.map(doc => doc.data() as {institution: string; program: string; degree: string; focus: string[]; startYear: number; endYear: number; gpa: string; order: number})
    .sort((a, b) => a.order - b.order);
});

export type PublishedArticle = {slug: string; title: string; summary?: string; coverUrl?: string; bodyMarkdown?: string};
export const getPublishedThoughts = cache(async (): Promise<PublishedArticle[]> => {
  const snapshot = await db().collection("thoughts").where("status", "==", "published").limit(50).get();
  return snapshot.docs.map(doc => ({...(doc.data().published as PublishedArticle), slug: doc.id}))
    .filter((item): item is PublishedArticle => Boolean(item?.slug));
});

export type PublishedResearch = {slug: string; title: string; category: string; summary: string; rows: [string, string][]};
export const getPublishedResearch = cache(async (): Promise<PublishedResearch[]> => {
  const snapshot = await db().collection("research").where("status", "==", "published").limit(50).get();
  return snapshot.docs.map(doc => ({...(doc.data().published as PublishedResearch), slug: doc.id}))
    .filter((item): item is PublishedResearch => Boolean(item?.title));
});

export const getHomePageContent = cache(async () => {
  const doc = await db().collection("pages").doc("homepage").get();
  return doc.data() as {headline: string; workHeading: string; experienceHeading: string;
    learningHeading: string; learning: {label: string; title: string; body: string}[];
    nextUp: {title: string; body: string}} | undefined;
});

export async function getPublicCredentialGroups() {
  const items = await getPublicCredentials();
  const groups = new Map<string, [string, string, string][]>();
  for (const item of items) {
    const group = groups.get(item.group) ?? [];
    group.push([item.title, item.issuer, item.href]);
    groups.set(item.group, group);
  }
  return [...groups].map(([label, items]) => ({label, items}));
}
