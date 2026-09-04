import Link from "next/link";
import type { PublicPageSettings, PublicResearch } from "@/lib/domain/content";
import { formatPreciseDate } from "@/lib/presentation/content";
import { ArchivePagination } from "@/components/ui/archive-pagination";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";

export function ResearchPage({ research, pageSettings, currentPage, pageSize = 8 }: {
  research: PublicResearch[]; pageSettings: PublicPageSettings | null;
  currentPage: number; pageSize?: number;
}) {
  const totalPages = Math.max(1, Math.ceil(research.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const visible = research.slice((page - 1) * pageSize, page * pageSize);
  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="03 / RESEARCH" title="Research, experiments, and applied inquiry."
      introduction={pageSettings?.intro} />
    <Container>
      {visible.length ? <ol className="border-b border-border">{visible.map((item, index) => {
        const number = (page - 1) * pageSize + index + 1;
        const date = formatPreciseDate(item.researchDate) ?? formatPreciseDate(item.academicPublishedDate);
        return <li key={item.id} className="border-t border-border py-10 md:py-14">
          <article className="editorial-grid items-start">
            <div className="col-span-full md:col-span-2 lg:col-span-2">
              <p className="type-metadata text-foreground-secondary">R.{String(number).padStart(2, "0")}</p>
              <p className="type-metadata mt-3 text-foreground-secondary">{item.researchType}</p>
              {date ? <p className="type-metadata mt-3 text-foreground-secondary">{date}</p> : null}
              {item.researchStage ? <Tag className="mt-5">{item.researchStage}</Tag> : null}
            </div>
            <div className="col-span-full mt-7 min-w-0 md:col-span-6 md:mt-0 lg:col-span-6">
              <h2 className="text-h2 text-balance"><Link href={`/research/${item.slug}`}
                className="hover:underline hover:underline-offset-4">{item.title}</Link></h2>
              <p className="mt-5 max-w-reading text-body-lg text-foreground-secondary">{item.summary}</p>
              <div className="mt-7 flex flex-wrap gap-2">{item.technologies.slice(0, 6).map((technology) => <Tag key={technology.key}>{technology.name}</Tag>)}</div>
              <Link href={`/research/${item.slug}`} className="mt-7 inline-flex min-h-target items-center font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep">Read research <span className="ml-2" aria-hidden="true">↗</span></Link>
            </div>
            <div className="col-span-full mt-7 md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9 lg:mt-0">
              {item.cover ? <MediaRenderer image={item.cover.image} caption={item.cover.caption}
                fit="contain" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 70vw, 100vw" /> : <div className="border-l border-accent bg-accent-very-soft px-5 py-6">
                  <p className="text-caption text-foreground-secondary">{item.roleOrContribution}</p>
                </div>}
            </div>
          </article>
        </li>;
      })}</ol> : <div className="border-y border-border py-16 md:py-24"><p className="max-w-reading text-body-lg text-foreground-secondary">
        {pageSettings?.emptyStateCopy ?? "No research has been published yet."}</p></div>}
      <ArchivePagination pathname="/research" currentPage={page} totalPages={totalPages} />
    </Container>
  </main>;
}
