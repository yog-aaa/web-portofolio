import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ResearchDetail } from "@/components/research/research-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { detailMetadata, unavailableMetadata } from "@/lib/presentation/metadata";
import { researchStructuredData } from "@/lib/presentation/structured-data";
import { getProfile, getResearchBySlug, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/research/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [research, settings] = await Promise.all([getResearchBySlug(slug), getSiteSettings()]);
  if (!research) return unavailableMetadata;
  const title = research.seoTitle ?? `${research.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = research.seoDescription ?? research.summary;
  const social = research.media.find((item) => item.role === "social") ?? research.cover;
  return detailMetadata({ title, description, canonicalPath: `/research/${research.slug}`,
    socialImage: social?.image, publishedAt: research.publishedAt, modifiedAt: research.publicUpdatedAt });
}

export default async function ResearchArticle({ params }: PageProps<"/research/[slug]">) {
  await connection();
  const { slug } = await params;
  const [research, profile] = await Promise.all([getResearchBySlug(slug), getProfile()]);
  if (!research) notFound();
  return <>
    <JsonLd data={researchStructuredData(research, profile)} />
    <ResearchDetail research={research} />
  </>;
}
