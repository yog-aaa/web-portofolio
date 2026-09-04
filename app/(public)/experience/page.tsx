import type { Metadata } from "next";
import { connection } from "next/server";
import { ExperiencePage } from "@/components/experience/experience-page";
import { getExperiences, getPageSettings, getSiteSettings } from "@/lib/queries/public-content";
import { pageMetadata } from "@/lib/presentation/metadata";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/experience"), getSiteSettings()]);
  return pageMetadata(page, settings, "Experience", "/experience");
}

export default async function ExperienceRoute() {
  await connection();
  const [experiences, pageSettings] = await Promise.all([getExperiences(), getPageSettings("/experience")]);
  return <ExperiencePage experiences={experiences} pageSettings={pageSettings} />;
}
