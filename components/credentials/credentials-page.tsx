import type { PublicCredential, PublicPageSettings } from "@/lib/domain/content";
import { formatPreciseDate, normalizeLabel } from "@/lib/presentation/content";
import { ArchiveFilter, type FilterOption } from "@/components/ui/archive-filter";
import { ArchivePagination } from "@/components/ui/archive-pagination";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";

export const credentialFilters: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI" },
  { key: "software", label: "Software" },
  { key: "cloud", label: "Cloud" },
  { key: "security", label: "Security" },
  { key: "other", label: "Other" },
];

const known: Record<string, string[]> = {
  ai: ["ai", "artificial-intelligence", "machine-learning", "computer-vision", "agentic-ai"],
  software: ["software", "software-development", "web-development", "programming"],
  cloud: ["cloud", "cloud-computing"],
  security: ["security", "cybersecurity", "information-security"],
};

export function resolveCredentialFilter(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return credentialFilters.some((option) => option.key === candidate) ? candidate! : "all";
}

function credentialCategory(value: string) {
  const normalized = normalizeLabel(value);
  for (const [category, aliases] of Object.entries(known)) if (aliases.includes(normalized)) return category;
  return "other";
}

export function CredentialsPage({ credentials, pageSettings, activeFilter, currentPage, pageSize = 12 }: {
  credentials: PublicCredential[]; pageSettings: PublicPageSettings | null; activeFilter: string;
  currentPage: number; pageSize?: number;
}) {
  const filtered = activeFilter === "all" ? credentials : credentials.filter((item) => credentialCategory(item.credentialType) === activeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="06 / CREDENTIALS" title="Credentials and supporting evidence."
      introduction={pageSettings?.intro} />
    <Container>
      <ArchiveFilter label="Filter credentials" pathname="/credentials" active={activeFilter} options={credentialFilters} />
      {visible.length ? <ol className="border-b border-border">{visible.map((credential, index) => <li key={credential.id}
        className="border-t border-border py-9 md:py-12">
        <article className="editorial-grid items-start">
          <div className="col-span-full md:col-span-2 lg:col-span-2">
            <p className="type-metadata text-foreground-secondary">C.{String((page - 1) * pageSize + index + 1).padStart(2, "0")}</p>
            <Tag className="mt-4">{credential.credentialType}</Tag>
          </div>
          <div className="col-span-full mt-6 min-w-0 md:col-span-4 md:mt-0 lg:col-span-5">
            <h2 className="text-h3">{credential.title}</h2>
            <p className="mt-2 text-body-lg text-foreground-secondary">{credential.issuerName}</p>
            {credential.description ? <p className="mt-5 max-w-reading text-foreground-secondary">{credential.description}</p> : null}
            {credential.verificationUrl ? <div className="mt-5"><ArrowLink href={credential.verificationUrl} external>View credential</ArrowLink></div> : null}
          </div>
          <dl className="col-span-full mt-6 grid grid-cols-2 gap-6 md:col-span-2 md:mt-0 lg:col-span-2">
            {formatPreciseDate(credential.issueDate) ? <div><dt className="type-metadata text-foreground-secondary">ISSUED</dt><dd className="mt-2">{formatPreciseDate(credential.issueDate)}</dd></div> : null}
            {formatPreciseDate(credential.expiryDate) ? <div><dt className="type-metadata text-foreground-secondary">EXPIRES</dt><dd className="mt-2">{formatPreciseDate(credential.expiryDate)}</dd></div> : null}
            {credential.publicIdentifier ? <div className="col-span-full"><dt className="type-metadata text-foreground-secondary">CREDENTIAL ID</dt><dd className="mt-2 break-words">{credential.publicIdentifier}</dd></div> : null}
          </dl>
          {credential.previewImage ? <MediaRenderer className="col-span-full mt-7 md:col-span-6 md:col-start-3 lg:col-span-3 lg:col-start-10 lg:mt-0"
            image={credential.previewImage} fit="contain" sizes="(min-width: 1024px) 22vw, (min-width: 768px) 60vw, 100vw" /> : null}
        </article>
      </li>)}</ol> : <div className="border-b border-border py-16 md:py-24">
        <p className="max-w-reading text-body-lg text-foreground-secondary">{pageSettings?.emptyStateCopy ??
          (activeFilter === "all" ? "No public credentials are available yet." : "No public credentials match this filter.")}</p>
        {activeFilter !== "all" ? <a href="/credentials" className="mt-5 inline-flex min-h-target items-center font-medium text-accent-deep underline underline-offset-4">Clear filter</a> : null}
      </div>}
      <ArchivePagination pathname="/credentials" currentPage={page} totalPages={totalPages} filter={activeFilter} />
    </Container>
  </main>;
}
