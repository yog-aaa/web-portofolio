import Link from "next/link";
import type { PublicPageSettings, PublicThought } from "@/lib/domain/content";
import { ArchivePagination } from "@/components/ui/archive-pagination";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";

function publishedDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function ThoughtsPage({ thoughts, pageSettings, currentPage, pageSize = 10 }: {
  thoughts: PublicThought[]; pageSettings: PublicPageSettings | null; currentPage: number; pageSize?: number;
}) {
  const totalPages = Math.max(1, Math.ceil(thoughts.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const visible = thoughts.slice((page - 1) * pageSize, page * pageSize);
  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="04 / THOUGHTS" title="Thoughts." introduction={pageSettings?.intro} />
    <Container>
      {visible.length ? <ol className="border-b border-border">{visible.map((thought, index) => <li key={thought.id} className="border-t border-border">
        <article className="editorial-grid py-9 md:py-12">
          <div className="col-span-full md:col-span-2 lg:col-span-2">
            <p className="type-metadata text-foreground-secondary">T.{String((page - 1) * pageSize + index + 1).padStart(2, "0")}</p>
            <time className="type-metadata mt-3 block text-foreground-secondary" dateTime={thought.publishedAt}>{publishedDate(thought.publishedAt)}</time>
          </div>
          <div className="col-span-full mt-6 min-w-0 md:col-span-6 md:mt-0 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {thought.category ? <Tag>{thought.category}</Tag> : null}
              <span className="type-metadata text-foreground-secondary">{thought.readingMinutes} MIN READ</span>
            </div>
            <h2 className="mt-4 text-h2 text-balance"><Link href={`/thoughts/${thought.slug}`}
              className="hover:underline hover:underline-offset-4">{thought.title}</Link></h2>
            <p className="mt-5 max-w-reading text-body-lg text-foreground-secondary">{thought.excerpt}</p>
            <Link href={`/thoughts/${thought.slug}`} className="mt-6 inline-flex min-h-target items-center font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep">Read thought <span className="ml-2" aria-hidden="true">↗</span></Link>
          </div>
          {thought.cover ? <MediaRenderer className="col-span-full mt-7 md:col-span-6 md:col-start-3 lg:col-span-3 lg:col-start-10 lg:mt-0"
            image={thought.cover.image} caption={thought.cover.caption} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 70vw, 100vw" /> : null}
        </article>
      </li>)}</ol> : <div className="border-y border-border py-16 md:py-24"><p className="max-w-reading text-body-lg text-foreground-secondary">
        {pageSettings?.emptyStateCopy ?? "No Thoughts have been published yet."}</p></div>}
      <ArchivePagination pathname="/thoughts" currentPage={page} totalPages={totalPages} />
    </Container>
  </main>;
}
