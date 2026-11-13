import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/porto-v2/detail-pages";
import { getPublicProjects } from "@/lib/porto-v2/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getPublicProjects()).find(item => item.slug === slug);
  return { title: project?.title ?? "Work", description: project?.subtitle };
}
export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  if (!(await getPublicProjects()).some(item => item.slug === slug)) notFound();
  return <CaseStudyPage slug={slug} />;
}
