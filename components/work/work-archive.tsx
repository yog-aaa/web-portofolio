import Link from "next/link";
import type { PublicPageSettings, PublicProject } from "@/lib/domain/content";
import { formatDateRange, normalizeLabel } from "@/lib/presentation/content";
import { ArchiveFilter, type FilterOption } from "@/components/ui/archive-filter";
import { ArchivePagination } from "@/components/ui/archive-pagination";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";

export const workFilters: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "software", label: "Software" },
  { key: "ai", label: "AI" },
  { key: "research", label: "Research" },
  { key: "experiments", label: "Experiments" },
];

const aliases: Record<string, string[]> = {
  software: ["software", "software-development", "web-development", "mobile-development", "product-development"],
  ai: ["ai", "artificial-intelligence", "machine-learning", "computer-vision", "agentic-ai"],
  research: ["research"],
  experiments: ["experiment", "experiments", "experimental"],
};

export function resolveWorkFilter(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return workFilters.some((option) => option.key === candidate) ? candidate! : "all";
}

export function filterProjects(projects: PublicProject[], filter: string) {
  if (filter === "all") return projects;
  const accepted = new Set(aliases[filter] ?? [filter]);
  return projects.filter((project) => project.categories.some((category) =>
    accepted.has(category.key) || accepted.has(normalizeLabel(category.name))));
}

export function WorkArchive({ projects, pageSettings, activeFilter, currentPage, pageSize = 8 }: {
  projects: PublicProject[]; pageSettings: PublicPageSettings | null; activeFilter: string;
  currentPage: number; pageSize?: number;
}) {
  const filtered = filterProjects(projects, activeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="01 / WORK" title="Selected work, explored in depth."
      introduction={pageSettings?.intro} />
    <Container>
      <ArchiveFilter label="Filter work" pathname="/work" active={activeFilter} options={workFilters} />
      {visible.length ? <ol className="border-b border-border">
        {visible.map((project, index) => {
          const count = (page - 1) * pageSize + index + 1;
          const reverse = count % 2 === 0;
          return <li key={project.id} className="border-t border-border py-10 md:py-14">
            <article className="editorial-grid items-start">
              <div className={`col-span-full ${reverse ? "lg:col-start-7" : "lg:col-start-1"} lg:col-span-6`}>
                {project.cover ? <MediaRenderer image={project.cover.image} caption={project.cover.caption}
                  sizes="(min-width: 1024px) 48vw, 100vw" />
                  : <div aria-hidden="true" className="aspect-[16/9] overflow-hidden bg-accent-very-soft p-5">
                    <div className="h-full border-l border-t border-border bg-[linear-gradient(135deg,transparent_49.8%,var(--border)_50%,transparent_50.2%)]" />
                  </div>}
              </div>
              <div className={`col-span-full mt-8 min-w-0 lg:col-span-5 lg:mt-0 ${reverse ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-8"}`}>
                <div className="flex items-center justify-between gap-4">
                  <p className="type-metadata text-foreground-secondary">P.{String(count).padStart(2, "0")}</p>
                  {formatDateRange(project.startDate, project.endDate) ? <p className="type-metadata text-foreground-secondary">{formatDateRange(project.startDate, project.endDate)}</p> : null}
                </div>
                <h2 className="mt-5 text-h2 text-balance"><Link href={`/work/${project.slug}`}
                  className="hover:underline hover:underline-offset-4">{project.title}</Link></h2>
                <p className="mt-5 text-body-lg text-foreground-secondary">{project.summary}</p>
                {project.categories.length || project.technologies.length ? <div className="mt-7 flex flex-wrap gap-2">
                  {[...project.categories, ...project.technologies].slice(0, 6).map((item) => <Tag key={`${item.key}-${item.name}`}>{item.name}</Tag>)}
                </div> : null}
                <Link href={`/work/${project.slug}`} className="mt-8 inline-flex min-h-target items-center font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep">
                  Read case study <span className="ml-2" aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </li>;
        })}
      </ol> : <div className="border-b border-border py-16 md:py-24">
        <p className="max-w-reading text-body-lg text-foreground-secondary">{pageSettings?.emptyStateCopy ??
          (activeFilter === "all" ? "No published projects are available yet." : "No published projects match this filter.")}</p>
        {activeFilter !== "all" ? <Link href="/work" className="mt-5 inline-flex min-h-target items-center font-medium text-accent-deep underline underline-offset-4">Clear filter</Link> : null}
      </div>}
      <ArchivePagination pathname="/work" currentPage={page} totalPages={totalPages} filter={activeFilter} />
    </Container>
  </main>;
}
