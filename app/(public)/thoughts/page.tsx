import type { Metadata } from "next";
import { connection } from "next/server";
import { ThoughtsPage } from "@/components/thoughts/thoughts-page";
import { pageMetadata } from "@/lib/presentation/metadata";
import { getPageSettings, getPublishedThoughts, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/thoughts"), getSiteSettings()]);
  return pageMetadata(page, settings, "Thoughts");
}

export default async function ThoughtsRoute({ searchParams }: PageProps<"/thoughts">) {
  await connection();
  const query = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(Array.isArray(query.page) ? query.page[0] : query.page ?? "1", 10) || 1);
  const [thoughts, pageSettings] = await Promise.all([getPublishedThoughts(), getPageSettings("/thoughts")]);
  return <ThoughtsPage thoughts={thoughts} pageSettings={pageSettings} currentPage={requestedPage} />;
}
