import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ThoughtArticle } from "@/components/thoughts/thought-article";
import { getProfile, getPublishedThoughts, getSiteSettings, getThoughtBySlug } from "@/lib/queries/public-content";

export async function generateMetadata({ params }: PageProps<"/thoughts/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [thought, settings] = await Promise.all([getThoughtBySlug(slug), getSiteSettings()]);
  if (!thought) return {};
  const title = thought.seoTitle ?? `${thought.title} — ${settings?.brandName ?? "YOGAAA."}`;
  const description = thought.seoDescription ?? thought.excerpt;
  const social = thought.media.find((item) => item.role === "social") ?? thought.cover;
  return { title, description, openGraph: social ? { title, description, type: "article",
    publishedTime: thought.publishedAt, modifiedTime: thought.publicUpdatedAt,
    images: [{ url: social.image.src, width: social.image.width, height: social.image.height, alt: social.image.alt }] }
    : { title, description, type: "article", publishedTime: thought.publishedAt, modifiedTime: thought.publicUpdatedAt } };
}

export default async function ThoughtRoute({ params }: PageProps<"/thoughts/[slug]">) {
  await connection();
  const { slug } = await params;
  const [thought, thoughts, profile] = await Promise.all([getThoughtBySlug(slug), getPublishedThoughts(), getProfile()]);
  if (!thought) notFound();
  const index = thoughts.findIndex((item) => item.id === thought.id);
  const previous = index >= 0 ? thoughts[index + 1] ?? null : null;
  const next = index > 0 ? thoughts[index - 1] : null;
  return <ThoughtArticle thought={thought} profile={profile} previous={previous} next={next} />;
}
