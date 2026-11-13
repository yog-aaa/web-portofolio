import { notFound } from "next/navigation";
import { PublishedResearchDetailPage } from "@/components/porto-v2/research-firestore";
import { getPublishedResearch } from "@/lib/porto-v2/content";
export const dynamic = "force-dynamic";
export default async function Page({params}: PageProps<"/research/[slug]">) {
  const {slug} = await params;
  if (!(await getPublishedResearch()).some(item => item.slug === slug)) notFound();
  return <PublishedResearchDetailPage slug={slug} />;
}
