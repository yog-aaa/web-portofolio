import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectCaseStudy } from "@/components/work/project-case-study";
import { detailMetadata, unavailableMetadata } from "@/lib/presentation/metadata";
import { projectStructuredData } from "@/lib/presentation/structured-data";
import { getProfile, getProjectBySlug, getPublishedProjects, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return unavailableMetadata;
  const title = project.seoTitle ?? `${project.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = project.seoDescription ?? project.summary;
  const social = project.media.find((item) => item.role === "social") ?? project.cover;
  return detailMetadata({ title, description, canonicalPath: `/work/${project.slug}`,
    socialImage: social?.image, publishedAt: project.publishedAt, modifiedAt: project.publicUpdatedAt });
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  await connection();
  const { slug } = await params;
  const [project, projects, profile] = await Promise.all([getProjectBySlug(slug), getPublishedProjects(), getProfile()]);
  if (!project) notFound();
  const current = projects.findIndex((item) => item.id === project.id);
  const nextProject = projects.length > 1 ? projects[(current + 1) % projects.length] : null;
  return <>
    <JsonLd data={projectStructuredData(project, profile)} />
    <ProjectCaseStudy project={project} nextProject={nextProject} />
  </>;
}
