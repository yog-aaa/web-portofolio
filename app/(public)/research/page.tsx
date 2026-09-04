import type { Metadata } from "next";
import { connection } from "next/server";
import { ResearchPage } from "@/components/research/research-page";
import { pageMetadata } from "@/lib/presentation/metadata";
import { getPageSettings, getPublishedResearch, getSiteSettings } from "@/lib/queries/public-content";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/research"), getSiteSettings()]);
  return pageMetadata(page, settings, "Research");
}

export default async function ResearchRoute({ searchParams }: PageProps<"/research">) {
  await connection();
  const query = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(Array.isArray(query.page) ? query.page[0] : query.page ?? "1", 10) || 1);
  const [research, pageSettings] = await Promise.all([getPublishedResearch(), getPageSettings("/research")]);
  return <ResearchPage research={research} pageSettings={pageSettings} currentPage={requestedPage} />;
}
