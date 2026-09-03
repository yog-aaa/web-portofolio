import type { Metadata } from "next";
import { connection } from "next/server";
import { PublicShell } from "@/components/site/public-shell";
import { getProfile, getSiteSettings, getThemeSettings } from "@/lib/queries/public-content";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getSiteSettings();
  if (!settings) return {};
  return {
    title: settings.siteTitle ?? settings.brandName,
    description: settings.defaultSeoDescription ?? undefined,
    openGraph: settings.defaultSocialImage ? { images: [{ url: settings.defaultSocialImage.src,
      width: settings.defaultSocialImage.width, height: settings.defaultSocialImage.height,
      alt: settings.defaultSocialImage.alt }] } : undefined,
  };
}

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  await connection();
  const [settings, theme, profile] = await Promise.all([getSiteSettings(), getThemeSettings(), getProfile()]);
  return <PublicShell settings={settings} theme={theme} profile={profile}>{children}</PublicShell>;
}
