import { connection } from "next/server";
import { HomePage } from "@/components/home/home-page";
import { getExperienceHighlight, getFeaturedProjects, getFeaturedResearch,
  getLatestThoughts, getProfile, getSiteSettings } from "@/lib/queries/public-content";

export default async function Page() {
  await connection();
  const [settings, profile, projects, experience, research, thoughts] = await Promise.all([
    getSiteSettings(), getProfile(), getFeaturedProjects(), getExperienceHighlight(),
    getFeaturedResearch(), getLatestThoughts(3),
  ]);
  return <HomePage settings={settings} profile={profile} projects={projects}
    experience={experience} research={research} thoughts={thoughts} />;
}
