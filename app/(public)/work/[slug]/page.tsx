import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/porto-v2/detail-pages";
import { projects } from "@/components/porto-v2/detail-data";
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  return { title: project?.title ?? "Work", description: project?.subtitle };
}
export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  if (!projects.some(item => item.slug === slug)) notFound();
  return <CaseStudyPage slug={slug} />;
}
