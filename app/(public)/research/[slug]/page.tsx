import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ResearchDetail } from "@/components/research/research-detail";
import { getResearchBySlug, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/research/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [research, settings] = await Promise.all([getResearchBySlug(slug), getSiteSettings()]);
  if (!research) return {};
  const title = research.seoTitle ?? `${research.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = research.seoDescription ?? research.summary;
  const social = research.media.find((item) => item.role === "social") ?? research.cover;
  return { title, description, openGraph: social ? { title, description, images: [{ url: social.image.src,
    width: social.image.width, height: social.image.height, alt: social.image.alt }] } : { title, description } };
}

export default async function ResearchArticle({ params }: PageProps<"/research/[slug]">) {
  await connection();
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) notFound();
  return <ResearchDetail research={research} />;
}
