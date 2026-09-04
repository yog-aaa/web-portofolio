import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/presentation/site-url";
import { getPublishedProjects, getPublishedResearch, getPublishedThoughts } from "@/lib/queries/public-content";

export const dynamic = "force-dynamic";

const staticPages: Array<{ path: string; priority: number; frequency: "weekly" | "monthly" }> = [
  { path: "/", priority: 1, frequency: "weekly" },
  { path: "/work", priority: 0.9, frequency: "weekly" },
  { path: "/experience", priority: 0.7, frequency: "monthly" },
  { path: "/research", priority: 0.9, frequency: "weekly" },
  { path: "/thoughts", priority: 0.9, frequency: "weekly" },
  { path: "/about", priority: 0.7, frequency: "monthly" },
  { path: "/credentials", priority: 0.6, frequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, research, thoughts] = await Promise.all([
    getPublishedProjects(), getPublishedResearch(), getPublishedThoughts(),
  ]);
  return [
    ...staticPages.map((page) => ({ url: absoluteSiteUrl(page.path),
      changeFrequency: page.frequency, priority: page.priority })),
    ...projects.map((item) => ({ url: absoluteSiteUrl(`/work/${item.slug}`),
      lastModified: item.publicUpdatedAt, changeFrequency: "monthly" as const, priority: 0.8,
      ...(item.cover ? { images: [item.cover.image.src] } : {}) })),
    ...research.map((item) => ({ url: absoluteSiteUrl(`/research/${item.slug}`),
      lastModified: item.publicUpdatedAt, changeFrequency: "monthly" as const, priority: 0.8,
      ...(item.cover ? { images: [item.cover.image.src] } : {}) })),
    ...thoughts.map((item) => ({ url: absoluteSiteUrl(`/thoughts/${item.slug}`),
      lastModified: item.publicUpdatedAt, changeFrequency: "monthly" as const, priority: 0.8,
      ...(item.cover ? { images: [item.cover.image.src] } : {}) })),
  ];
}
