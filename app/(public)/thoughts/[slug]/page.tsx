import { notFound } from "next/navigation";
import { PublishedThoughtPage } from "@/components/porto-v2/thoughts-firestore";
import { getPublishedThoughts } from "@/lib/porto-v2/content";
export const dynamic = "force-dynamic";
export default async function Page({params}: PageProps<"/thoughts/[slug]">) {
  const {slug} = await params;
  if (!(await getPublishedThoughts()).some(item => item.slug === slug)) notFound();
  return <PublishedThoughtPage slug={slug} />;
}
