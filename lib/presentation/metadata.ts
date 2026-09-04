import type { Metadata } from "next";
import type { MediaImageData } from "@/lib/domain/media";
import type { PublicPageSettings, PublicSiteSettings } from "@/lib/domain/content";
import { absoluteSiteUrl } from "./site-url";

type DetailMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  socialImage?: MediaImageData | null;
  publishedAt?: string;
  modifiedAt?: string;
};

function socialImages(image?: MediaImageData | null) {
  return image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined;
}

function socialMetadata({ title, description, canonicalPath, socialImage, publishedAt, modifiedAt }: DetailMetadataInput): Metadata {
  const images = socialImages(socialImage);
  const canonical = absoluteSiteUrl(canonicalPath);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "YOGAAA.",
      type: publishedAt ? "article" : "website",
      ...(publishedAt ? { publishedTime: publishedAt, modifiedTime: modifiedAt } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export function pageMetadata(page: PublicPageSettings | null, settings: PublicSiteSettings | null,
  fallbackTitle: string, canonicalPath: string): Metadata {
  const title = page?.seoTitle ?? `${fallbackTitle} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = page?.seoDescription ?? page?.intro ?? settings?.defaultSeoDescription ??
    `Explore ${fallbackTitle.toLowerCase()} by Yoga Agustiansyah.`;
  return socialMetadata({ title, description, canonicalPath,
    socialImage: page?.socialImage ?? settings?.defaultSocialImage });
}

export function homeMetadata(page: PublicPageSettings | null, settings: PublicSiteSettings | null): Metadata {
  const title = page?.seoTitle ?? settings?.siteTitle ?? "Yoga Agustiansyah — Software, AI & Research";
  const description = page?.seoDescription ?? settings?.defaultSeoDescription ??
    "The personal website of Yoga Agustiansyah, featuring software, artificial intelligence, and research work.";
  return socialMetadata({ title, description, canonicalPath: "/",
    socialImage: page?.socialImage ?? settings?.defaultSocialImage });
}

export function detailMetadata(input: DetailMetadataInput): Metadata {
  return socialMetadata(input);
}

export const unavailableMetadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};
