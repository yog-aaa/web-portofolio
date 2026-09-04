import type { Metadata } from "next";
import { connection } from "next/server";
import { AboutPage } from "@/components/about/about-page";
import { getCredentials, getPageSettings, getProfile, getPublishedProjects, getSiteSettings } from "@/lib/queries/public-content";
import { pageMetadata } from "@/lib/presentation/metadata";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/about"), getSiteSettings()]);
  return pageMetadata(page, settings, "About", "/about");
}

export default async function AboutRoute() {
  await connection();
  const [profile, projects, credentials, pageSettings] = await Promise.all([
    getProfile(), getPublishedProjects(), getCredentials(), getPageSettings("/about"),
  ]);
  return <AboutPage profile={profile} projects={projects} credentials={credentials} pageSettings={pageSettings} />;
}
