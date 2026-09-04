import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ThoughtArticle } from "@/components/thoughts/thought-article";
import { JsonLd } from "@/components/seo/json-ld";
import { detailMetadata, unavailableMetadata } from "@/lib/presentation/metadata";
import { thoughtStructuredData } from "@/lib/presentation/structured-data";
import { getProfile, getPublishedThoughts, getSiteSettings, getThoughtBySlug } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/thoughts/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [thought, settings] = await Promise.all([getThoughtBySlug(slug), getSiteSettings()]);
  if (!thought) return unavailableMetadata;
  const title = thought.seoTitle ?? `${thought.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = thought.seoDescription ?? thought.excerpt;
  const social = thought.media.find((item) => item.role === "social") ?? thought.cover;
  return detailMetadata({ title, description, canonicalPath: `/thoughts/${thought.slug}`,
    socialImage: social?.image, publishedAt: thought.publishedAt, modifiedAt: thought.publicUpdatedAt });
}

export default async function ThoughtRoute({ params }: PageProps<"/thoughts/[slug]">) {
  await connection();
  const { slug } = await params;
  const [thought, thoughts, profile] = await Promise.all([getThoughtBySlug(slug), getPublishedThoughts(), getProfile()]);
  if (!thought) notFound();
  const index = thoughts.findIndex((item) => item.id === thought.id);
  const previous = index >= 0 ? thoughts[index + 1] ?? null : null;
  const next = index > 0 ? thoughts[index - 1] : null;
  return <>
    <JsonLd data={thoughtStructuredData(thought, profile)} />
    <ThoughtArticle thought={thought} profile={profile} previous={previous} next={next} />
  </>;
}
