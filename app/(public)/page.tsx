import type { Metadata } from "next";
import { connection } from "next/server";
import { HomePage } from "@/components/home/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getExperienceHighlight, getFeaturedProjects, getFeaturedResearch,
  getLatestThoughts, getPageSettings, getProfile, getSiteSettings } from "@/lib/queries/public-content";
import { homeMetadata } from "@/lib/presentation/metadata";
import { homeStructuredData } from "@/lib/presentation/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/"), getSiteSettings()]);
  return homeMetadata(page, settings);
}

export default async function Page() {
  await connection();
  const [settings, profile, projects, experience, research, thoughts] = await Promise.all([
    getSiteSettings(), getProfile(), getFeaturedProjects(), getExperienceHighlight(),
    getFeaturedResearch(), getLatestThoughts(3),
  ]);
  return <>
    <JsonLd data={homeStructuredData(settings, profile)} />
    <HomePage settings={settings} profile={profile} projects={projects}
      experience={experience} research={research} thoughts={thoughts} />
  </>;
}
