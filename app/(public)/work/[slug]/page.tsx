import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProjectCaseStudy } from "@/components/work/project-case-study";
import { getProjectBySlug, getPublishedProjects, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return {};
  const title = project.seoTitle ?? `${project.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = project.seoDescription ?? project.summary;
  const social = project.media.find((item) => item.role === "social") ?? project.cover;
  return { title, description, openGraph: social ? { title, description, images: [{ url: social.image.src,
    width: social.image.width, height: social.image.height, alt: social.image.alt }] } : { title, description } };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  await connection();
  const { slug } = await params;
  const [project, projects] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);
  if (!project) notFound();
  const current = projects.findIndex((item) => item.id === project.id);
  const nextProject = projects.length > 1 ? projects[(current + 1) % projects.length] : null;
  return <ProjectCaseStudy project={project} nextProject={nextProject} />;
}
