import type { Metadata } from "next";
import { connection } from "next/server";
import { WorkArchive, resolveWorkFilter } from "@/components/work/work-archive";
import { getPageSettings, getPublishedProjects, getSiteSettings } from "@/lib/queries/public-content";
import { pageMetadata } from "@/lib/presentation/metadata";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/work"), getSiteSettings()]);
  return pageMetadata(page, settings, "Work");
}

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  await connection();
  const query = await searchParams;
  const activeFilter = resolveWorkFilter(query.filter);
  const requestedPage = Math.max(1, Number.parseInt(Array.isArray(query.page) ? query.page[0] : query.page ?? "1", 10) || 1);
  const [projects, pageSettings] = await Promise.all([getPublishedProjects(), getPageSettings("/work")]);
  return <WorkArchive projects={projects} pageSettings={pageSettings} activeFilter={activeFilter} currentPage={requestedPage} />;
}
