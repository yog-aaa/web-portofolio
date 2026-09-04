import type { Metadata } from "next";
import { connection } from "next/server";
import { CredentialsPage, resolveCredentialFilter } from "@/components/credentials/credentials-page";
import { getCredentials, getPageSettings, getSiteSettings } from "@/lib/queries/public-content";
import { pageMetadata } from "@/lib/presentation/metadata";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [page, settings] = await Promise.all([getPageSettings("/credentials"), getSiteSettings()]);
  return pageMetadata(page, settings, "Credentials");
}

export default async function CredentialsRoute({ searchParams }: PageProps<"/credentials">) {
  await connection();
  const query = await searchParams;
  const activeFilter = resolveCredentialFilter(query.filter);
  const requestedPage = Math.max(1, Number.parseInt(Array.isArray(query.page) ? query.page[0] : query.page ?? "1", 10) || 1);
  const [credentials, pageSettings] = await Promise.all([getCredentials(), getPageSettings("/credentials")]);
  return <CredentialsPage credentials={credentials} pageSettings={pageSettings} activeFilter={activeFilter} currentPage={requestedPage} />;
}
