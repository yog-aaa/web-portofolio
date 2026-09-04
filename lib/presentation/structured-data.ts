import type { PublicProfile, PublicProjectDetail, PublicResearchDetail,
  PublicSiteSettings, PublicThoughtDetail } from "@/lib/domain/content";
import { absoluteSiteUrl } from "./site-url";

type JsonLdNode = Record<string, unknown>;

function person(profile: PublicProfile | null): JsonLdNode {
  const sameAs = profile?.socialLinks.map((item) => item.destination)
    .filter((destination) => {
      try { return new URL(destination).protocol === "https:"; }
      catch { return false; }
    });
  return {
    "@type": "Person",
    "@id": `${absoluteSiteUrl("/about")}#person`,
    name: profile?.displayName ?? "Yoga Agustiansyah",
    url: absoluteSiteUrl("/about"),
    ...(profile?.shortBiography ? { description: profile.shortBiography } : {}),
    ...(profile?.portrait ? { image: profile.portrait.src } : {}),
    ...(profile?.location ? { homeLocation: { "@type": "Place", name: profile.location } } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

function breadcrumbs(parentName: string, parentPath: string, title: string, path: string): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteSiteUrl("/") },
      { "@type": "ListItem", position: 2, name: parentName, item: absoluteSiteUrl(parentPath) },
      { "@type": "ListItem", position: 3, name: title, item: absoluteSiteUrl(path) },
    ],
  };
}

export function homeStructuredData(settings: PublicSiteSettings | null, profile: PublicProfile | null) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(profile),
      {
        "@type": "WebSite",
        "@id": `${absoluteSiteUrl("/")}#website`,
        name: settings?.brandName ?? "YOGAAA.",
        alternateName: "Yoga Agustiansyah",
        url: absoluteSiteUrl("/"),
        ...(settings?.defaultSeoDescription ? { description: settings.defaultSeoDescription } : {}),
        author: { "@id": `${absoluteSiteUrl("/about")}#person` },
        inLanguage: settings?.contentLanguage ?? "en",
      },
    ],
  };
}

export function projectStructuredData(project: PublicProjectDetail, profile: PublicProfile | null) {
  const path = `/work/${project.slug}`;
  const image = project.media.find((item) => item.role === "social")?.image ?? project.cover?.image;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${absoluteSiteUrl(path)}#work`,
        name: project.title,
        description: project.summary,
        url: absoluteSiteUrl(path),
        datePublished: project.publishedAt,
        dateModified: project.publicUpdatedAt,
        creator: { "@id": `${absoluteSiteUrl("/about")}#person` },
        ...(image ? { image: image.src } : {}),
        ...(project.categories.length || project.technologies.length
          ? { keywords: [...project.categories, ...project.technologies].map((item) => item.name).join(", ") } : {}),
      },
      person(profile),
      breadcrumbs("Work", "/work", project.title, path),
    ],
  };
}

export function researchStructuredData(research: PublicResearchDetail, profile: PublicProfile | null) {
  const path = `/research/${research.slug}`;
  const image = research.media.find((item) => item.role === "social")?.image ?? research.cover?.image;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${absoluteSiteUrl(path)}#research`,
        name: research.title,
        description: research.summary,
        genre: "Research",
        url: absoluteSiteUrl(path),
        datePublished: research.publishedAt,
        dateModified: research.publicUpdatedAt,
        creator: { "@id": `${absoluteSiteUrl("/about")}#person` },
        ...(research.institution ? { sourceOrganization: { "@type": "Organization", name: research.institution } } : {}),
        ...(image ? { image: image.src } : {}),
        ...(research.technologies.length ? { keywords: research.technologies.map((item) => item.name).join(", ") } : {}),
      },
      person(profile),
      breadcrumbs("Research", "/research", research.title, path),
    ],
  };
}

export function thoughtStructuredData(thought: PublicThoughtDetail, profile: PublicProfile | null) {
  const path = `/thoughts/${thought.slug}`;
  const image = thought.media.find((item) => item.role === "social")?.image ?? thought.cover?.image;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${absoluteSiteUrl(path)}#article`,
        headline: thought.title,
        description: thought.excerpt,
        url: absoluteSiteUrl(path),
        mainEntityOfPage: absoluteSiteUrl(path),
        datePublished: thought.publishedAt,
        dateModified: thought.publicUpdatedAt,
        author: { "@id": `${absoluteSiteUrl("/about")}#person` },
        ...(thought.category ? { articleSection: thought.category } : {}),
        ...(image ? { image: image.src } : {}),
      },
      person(profile),
      breadcrumbs("Thoughts", "/thoughts", thought.title, path),
    ],
  };
}
