import type { Metadata } from "next";
import type { PublicPageSettings, PublicSiteSettings } from "@/lib/domain/content";

export function pageMetadata(page: PublicPageSettings | null, settings: PublicSiteSettings | null,
  fallbackTitle: string): Metadata {
  const title = page?.seoTitle ?? `${fallbackTitle} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = page?.seoDescription ?? page?.intro ?? settings?.defaultSeoDescription ?? undefined;
  const socialImage = page?.socialImage ?? settings?.defaultSocialImage;
  return {
    title,
    description,
    openGraph: socialImage ? { title, description, images: [{ url: socialImage.src,
      width: socialImage.width, height: socialImage.height, alt: socialImage.alt }] } : { title, description },
  };
}
