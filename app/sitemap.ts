import type { MetadataRoute } from "next";
import { projects } from "@/components/porto-v2/detail-data";
import { absoluteSiteUrl } from "@/lib/presentation/site-url";

const pages: Array<{ path: string; priority: number; frequency: "weekly" | "monthly" }> = [
  { path: "/", priority: 1, frequency: "weekly" },
  { path: "/work", priority: 0.9, frequency: "weekly" },
  { path: "/experience", priority: 0.7, frequency: "monthly" },
  { path: "/research", priority: 0.7, frequency: "monthly" },
  { path: "/thoughts", priority: 0.6, frequency: "monthly" },
  { path: "/about", priority: 0.7, frequency: "monthly" },
  { path: "/credentials", priority: 0.6, frequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map(page => ({ url: absoluteSiteUrl(page.path), changeFrequency: page.frequency, priority: page.priority })),
    ...projects.map(project => ({ url: absoluteSiteUrl(`/work/${project.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
