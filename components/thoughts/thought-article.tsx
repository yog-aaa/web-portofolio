import Link from "next/link";
import type { PublicProfile, PublicThought, PublicThoughtDetail } from "@/lib/domain/content";
import { isSafeExternalHref } from "@/lib/presentation/content";
import { SafeMarkdown } from "@/components/content/safe-markdown";
import { ReadingProgress } from "@/components/thoughts/reading-progress";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { Tag } from "@/components/ui/tag";

function publishedDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function ThoughtArticle({ thought, profile, previous, next }: {
  thought: PublicThoughtDetail; profile: PublicProfile | null;
  previous: PublicThought | null; next: PublicThought | null;
}) {
  const references = thought.references.filter((item) => isSafeExternalHref(item.url));
  const bodyMedia = thought.media.filter((item) => item.role === "body");
  return <main id="main-content" className="flex-1">
    <ReadingProgress />
    <Container as="article" className="pb-section pt-12 md:pt-20">
      <Link href="/thoughts" className="type-metadata inline-flex min-h-target items-center text-foreground-secondary underline underline-offset-4">← BACK TO THOUGHTS</Link>
      <header className="mx-auto mt-10 max-w-[46rem] border-b border-border pb-10 md:pb-14">
        <div className="flex flex-wrap items-center gap-3">
          {thought.category ? <Tag>{thought.category}</Tag> : null}
          <span className="type-metadata text-foreground-secondary">{thought.readingMinutes} MIN READ</span>
        </div>
        <h1 className="mt-6 text-h1 text-balance">{thought.title}</h1>
        <p className="mt-7 text-body-lg text-foreground-secondary">{thought.excerpt}</p>
        <div className="type-metadata mt-7 flex flex-wrap gap-x-5 gap-y-2 text-foreground-secondary">
          {profile ? <span>{profile.displayName}</span> : null}
          <time dateTime={thought.publishedAt}>{publishedDate(thought.publishedAt)}</time>
          {thought.publicUpdatedAt !== thought.publishedAt ? <span>UPDATED {publishedDate(thought.publicUpdatedAt)}</span> : null}
        </div>
      </header>
      {thought.cover ? <MediaRenderer className="mx-auto mt-10 max-w-content md:mt-14" image={thought.cover.image}
        caption={thought.cover.caption} priority sizes="(min-width: 1024px) 1024px, 100vw" /> : null}
      <SafeMarkdown markdown={thought.bodyMarkdown} media={bodyMedia} measure="article"
        headingContext="article" className="mx-auto mt-12 md:mt-16" />

      {references.length ? <section className="mx-auto mt-section-compact max-w-[46rem] border-t border-border pt-8" aria-labelledby="thought-references">
        <p className="type-metadata text-foreground-secondary">REFERENCES</p>
        <h2 id="thought-references" className="mt-3 text-h3">Sources and further reading</h2>
        <ul className="mt-6 border-t border-border">{references.map((item) => <li key={`${item.label}-${item.url}`} className="border-b border-border py-3"><ArrowLink href={item.url} external>{item.label}</ArrowLink></li>)}</ul>
      </section> : null}
    </Container>

    <nav aria-label="More Thoughts" className="border-t border-border bg-surface py-section-compact">
      <Container>
        <div className="grid gap-10 md:grid-cols-2">
          <div>{previous ? <Link href={`/thoughts/${previous.slug}`} className="group block border-t border-border pt-5">
            <p className="type-metadata text-foreground-secondary">PREVIOUS ARTICLE</p>
            <p className="mt-3 text-h3 group-hover:underline group-hover:underline-offset-4">{previous.title}</p>
          </Link> : null}</div>
          <div>{next ? <Link href={`/thoughts/${next.slug}`} className="group block border-t border-border pt-5 md:text-right">
            <p className="type-metadata text-foreground-secondary">NEXT ARTICLE</p>
            <p className="mt-3 text-h3 group-hover:underline group-hover:underline-offset-4">{next.title}</p>
          </Link> : null}</div>
        </div>
        <div className="mt-10"><ArrowLink href="/thoughts">Back to Thoughts</ArrowLink></div>
      </Container>
    </nav>
  </main>;
}
