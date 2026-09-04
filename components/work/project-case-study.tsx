import Link from "next/link";
import type { PublicProject, PublicProjectDetail } from "@/lib/domain/content";
import { formatDateRange, isSafeExternalHref } from "@/lib/presentation/content";
import { parseProjectCaseStudy, type CaseStudySectionKey } from "@/lib/presentation/project-case-study";
import { SafeMarkdown } from "@/components/content/safe-markdown";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { Tag } from "@/components/ui/tag";

const order: CaseStudySectionKey[] = ["overview", "problem", "objective", "role", "approach",
  "architecture", "technology", "challenges", "results", "learning"];

export function ProjectCaseStudy({ project, nextProject }: {
  project: PublicProjectDetail; nextProject: PublicProject | null;
}) {
  const parsed = parseProjectCaseStudy(project.bodyMarkdown);
  const sections = order.map((key) => ({ key, entries: parsed.filter((section) => section.key === key) }))
    .filter((section) => section.entries.length || section.key === "overview" || section.key === "role" ||
      (section.key === "technology" && project.technologies.length));
  const additional = parsed.filter((section) => section.key === "additional");
  const gallery = project.media.filter((item) => item.role === "gallery");
  const resources = project.links.filter((item) => isSafeExternalHref(item.url));

  return <main id="main-content" className="flex-1">
    <Container as="article" className="pb-section pt-12 md:pt-20">
      <Link href="/work" className="type-metadata inline-flex min-h-target items-center text-foreground-secondary underline underline-offset-4">← ALL WORK</Link>
      <header className="editorial-grid mt-10 items-end border-b border-border pb-10 md:pb-14">
        <div className="col-span-full lg:col-span-8">
          {project.categories.length ? <p className="type-metadata text-accent-deep">{project.categories.map((item) => item.name).join(" · ")}</p> : null}
          <h1 className="mt-5 max-w-[15ch] text-h1 text-balance">{project.title}</h1>
          <p className="mt-7 max-w-reading text-body-lg text-foreground-secondary">{project.summary}</p>
        </div>
        <dl className="col-span-full mt-10 grid grid-cols-2 gap-x-6 gap-y-6 lg:col-span-4 lg:mt-0">
          {formatDateRange(project.startDate, project.endDate) ? <div><dt className="type-metadata text-foreground-secondary">PERIOD</dt><dd className="mt-2">{formatDateRange(project.startDate, project.endDate)}</dd></div> : null}
          <div><dt className="type-metadata text-foreground-secondary">ROLE</dt><dd className="mt-2">{project.roleOrContribution}</dd></div>
        </dl>
      </header>
      {project.cover ? <MediaRenderer className="mt-10 md:mt-14" image={project.cover.image}
        caption={project.cover.caption} priority sizes="(min-width: 1280px) 1280px, 100vw" /> : null}

      <div className="mt-section-compact border-t border-border">
        {sections.map(({ key, entries }, index) => <section key={key} aria-labelledby={`case-${key}`}
          className="editorial-grid border-b border-border py-10 md:py-14">
          <div className="col-span-full lg:col-span-3">
            <p className="type-metadata text-foreground-secondary">{String(index + 1).padStart(2, "0")}</p>
            <h2 id={`case-${key}`} className="mt-3 text-h3">{key === "learning" ? "What I Learned" : key[0].toUpperCase() + key.slice(1)}</h2>
          </div>
          <div className="col-span-full mt-7 min-w-0 lg:col-span-8 lg:col-start-5 lg:mt-0">
            {key === "overview" && !entries.length ? <p className="max-w-reading text-body-lg text-foreground-secondary">{project.summary}</p> : null}
            {key === "role" ? <p className="mb-5 max-w-reading text-body-lg text-foreground-secondary">{project.roleOrContribution}</p> : null}
            {key === "technology" && project.technologies.length ? <div className="mb-6 flex flex-wrap gap-2">{project.technologies.map((item) => <Tag key={item.key}>{item.name}</Tag>)}</div> : null}
            {entries.map((entry, entryIndex) => <SafeMarkdown key={`${key}-${entryIndex}`} markdown={entry.markdown} media={project.media}
              className={entryIndex ? "mt-7 border-t border-border pt-7" : ""} />)}
          </div>
        </section>)}
        {additional.map((section, index) => <section key={`${section.label}-${index}`} className="editorial-grid border-b border-border py-10 md:py-14">
          <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">{String(sections.length + index + 1).padStart(2, "0")}</p><h2 className="mt-3 text-h3">{section.label}</h2></div>
          <SafeMarkdown markdown={section.markdown} media={project.media} className="col-span-full mt-7 lg:col-span-8 lg:col-start-5 lg:mt-0" />
        </section>)}
      </div>

      {gallery.length ? <section className="py-section-compact" aria-labelledby="gallery-title">
        <div className="editorial-grid items-start"><div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">GALLERY</p><h2 id="gallery-title" className="mt-3 text-h3">Project gallery</h2></div>
          <div className="col-span-full mt-8 grid gap-8 md:grid-cols-2 lg:col-span-9 lg:mt-0">{gallery.map((item) => <MediaRenderer key={item.id} image={item.image} caption={item.caption} sizes="(min-width: 1024px) 36vw, (min-width: 768px) 48vw, 100vw" />)}</div>
        </div>
      </section> : null}

      {resources.length ? <section className="editorial-grid border-t border-border py-section-compact" aria-labelledby="resources-title">
        <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">RESOURCES</p><h2 id="resources-title" className="mt-3 text-h3">Evidence and links</h2></div>
        <ul className="col-span-full mt-8 border-t border-border lg:col-span-8 lg:col-start-5 lg:mt-0">{resources.map((item) => <li key={`${item.label}-${item.url}`} className="border-b border-border py-3"><ArrowLink href={item.url} external>{item.label}</ArrowLink></li>)}</ul>
      </section> : null}
    </Container>

    <section className="border-t border-border bg-surface py-section-compact">
      <Container>{nextProject ? <div className="editorial-grid items-end">
        <p className="type-metadata col-span-full text-foreground-secondary lg:col-span-3">NEXT PROJECT</p>
        <div className="col-span-full mt-6 lg:col-span-9 lg:mt-0"><Link href={`/work/${nextProject.slug}`} className="group block">
          <h2 className="max-w-[16ch] text-h2 text-balance group-hover:underline group-hover:underline-offset-4">{nextProject.title}</h2>
          <p className="mt-4 max-w-reading text-foreground-secondary">{nextProject.summary}</p>
        </Link></div>
      </div> : <ArrowLink href="/work">Explore all work</ArrowLink>}</Container>
    </section>
  </main>;
}
