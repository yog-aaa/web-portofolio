import Link from "next/link";
import type { PublicMediaReference, PublicResearchDetail } from "@/lib/domain/content";
import { formatPreciseDate, isSafeExternalHref } from "@/lib/presentation/content";
import { parseResearchDocument, type ResearchSectionKey } from "@/lib/presentation/research-document";
import { SafeMarkdown } from "@/components/content/safe-markdown";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { Tag } from "@/components/ui/tag";

const order: ResearchSectionKey[] = ["abstract", "question", "motivation", "methodology", "dataset",
  "pipeline", "models", "experimental-setup", "results", "discussion", "limitations", "conclusion"];

function Figure({ item, number }: { item: PublicMediaReference; number: number }) {
  return <div className="border-t border-border pt-5">
    <p className="type-metadata mb-4 text-foreground-secondary">FIGURE {String(number).padStart(2, "0")}</p>
    <MediaRenderer image={item.image} caption={item.caption} fit="contain"
      sizes="(min-width: 1024px) 48vw, 100vw" />
  </div>;
}

export function ResearchDetail({ research }: { research: PublicResearchDetail }) {
  const parsed = parseResearchDocument(research.bodyMarkdown);
  const sections = order.map((key) => ({ key, entries: parsed.filter((section) => section.key === key) }))
    .filter(({ key, entries }) => entries.length || key === "abstract" || (key === "models" && research.technologies.length));
  const additional = parsed.filter((section) => section.key === "additional");
  const embeddedMedia = new Set([...research.bodyMarkdown.matchAll(/media:([a-z0-9-]+)/gi)].map((match) => match[1]));
  const inlineMedia = research.media.filter((item) => item.role === "body" || item.role === "figure");
  const figures = research.media.filter((item) => item.role === "figure" &&
    !embeddedMedia.has(item.id) && !embeddedMedia.has(item.image.id));
  const resources = research.links.filter((item) => isSafeExternalHref(item.url));
  const doiUrl = research.doi && /^10\.\d{4,9}\/[\S]+$/i.test(research.doi) ? `https://doi.org/${research.doi}` : null;

  return <main id="main-content" className="flex-1">
    <Container as="article" className="pb-section pt-12 md:pt-20">
      <Link href="/research" className="type-metadata inline-flex min-h-target items-center text-foreground-secondary underline underline-offset-4">← ALL RESEARCH</Link>
      <header className="editorial-grid mt-10 border-b border-border pb-10 md:pb-14">
        <div className="col-span-full lg:col-span-8">
          <p className="type-metadata text-accent-deep">{research.researchType}{research.researchStage ? ` · ${research.researchStage}` : ""}</p>
          <h1 className="mt-5 max-w-[16ch] text-h1 text-balance">{research.title}</h1>
          <p className="mt-7 max-w-[46rem] text-body-lg text-foreground-secondary">{research.summary}</p>
        </div>
        <dl className="col-span-full mt-10 grid grid-cols-2 gap-x-6 gap-y-7 lg:col-span-4 lg:mt-0">
          <div className="col-span-2"><dt className="type-metadata text-foreground-secondary">CONTRIBUTION</dt><dd className="mt-2">{research.roleOrContribution}</dd></div>
          {formatPreciseDate(research.researchDate) ? <div><dt className="type-metadata text-foreground-secondary">RESEARCH DATE</dt><dd className="mt-2">{formatPreciseDate(research.researchDate)}</dd></div> : null}
          {research.institution ? <div><dt className="type-metadata text-foreground-secondary">INSTITUTION</dt><dd className="mt-2">{research.institution}</dd></div> : null}
          {research.venue ? <div><dt className="type-metadata text-foreground-secondary">VENUE</dt><dd className="mt-2">{research.venue}</dd></div> : null}
          {formatPreciseDate(research.academicPublishedDate) ? <div><dt className="type-metadata text-foreground-secondary">ACADEMIC DATE</dt><dd className="mt-2">{formatPreciseDate(research.academicPublishedDate)}</dd></div> : null}
        </dl>
      </header>
      {research.cover ? <MediaRenderer className="mt-10 md:mt-14" image={research.cover.image}
        caption={research.cover.caption} fit="contain" priority sizes="(min-width: 1280px) 1280px, 100vw" /> : null}

      <div className="mt-section-compact border-t border-border">
        {sections.map(({ key, entries }, index) => <section key={key} className="editorial-grid border-b border-border py-10 md:py-14" aria-labelledby={`research-${key}`}>
          <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">{String(index + 1).padStart(2, "0")}</p><h2 id={`research-${key}`} className="mt-3 text-h3">{key === "question" ? "Research Question" : key === "pipeline" ? "System Pipeline" : key === "experimental-setup" ? "Experimental Setup" : key[0].toUpperCase() + key.slice(1)}</h2></div>
          <div className="col-span-full mt-7 min-w-0 lg:col-span-8 lg:col-start-5 lg:mt-0">
            {key === "abstract" && !entries.length ? <p className="max-w-[46rem] text-body-lg text-foreground-secondary">{research.summary}</p> : null}
            {key === "models" && research.technologies.length ? <div className="mb-6 flex flex-wrap gap-2">{research.technologies.map((item) => <Tag key={item.key}>{item.name}</Tag>)}</div> : null}
            {entries.map((entry, entryIndex) => <SafeMarkdown key={`${key}-${entryIndex}`} markdown={entry.markdown}
              media={inlineMedia} measure="article" tone="research" className={entryIndex ? "mt-7 border-t border-border pt-7" : ""} />)}
          </div>
        </section>)}
        {additional.map((section, index) => <section key={`${section.label}-${index}`} className="editorial-grid border-b border-border py-10 md:py-14">
          <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">{String(sections.length + index + 1).padStart(2, "0")}</p><h2 className="mt-3 text-h3">{section.label}</h2></div>
          <SafeMarkdown markdown={section.markdown} media={inlineMedia} measure="article" tone="research"
            className="col-span-full mt-7 lg:col-span-8 lg:col-start-5 lg:mt-0" />
        </section>)}
      </div>

      {figures.length ? <section className="editorial-grid py-section-compact" aria-labelledby="research-figures">
        <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">FIGURES</p><h2 id="research-figures" className="mt-3 text-h3">Figures and diagrams</h2></div>
        <div className="col-span-full mt-8 grid gap-10 lg:col-span-8 lg:col-start-5 lg:mt-0">{figures.map((item, index) => <Figure key={item.id} item={item} number={index + 1} />)}</div>
      </section> : null}

      {research.citationText || resources.length || research.doi ? <section className="editorial-grid border-t border-border py-section-compact" aria-labelledby="research-resources">
        <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">RESOURCES</p><h2 id="research-resources" className="mt-3 text-h3">Sources and references</h2></div>
        <div className="col-span-full mt-8 lg:col-span-8 lg:col-start-5 lg:mt-0">
          {research.citationText ? <blockquote className="border-l-2 border-accent bg-accent-very-soft px-5 py-5 text-foreground">{research.citationText}</blockquote> : null}
          <ul className="mt-6 border-t border-border">
            {doiUrl ? <li className="border-b border-border py-3"><ArrowLink href={doiUrl} external>DOI: {research.doi}</ArrowLink></li> : research.doi ? <li className="border-b border-border py-3"><span className="type-metadata text-foreground-secondary">DOI</span><p className="mt-1 break-words">{research.doi}</p></li> : null}
            {resources.map((item) => <li key={`${item.label}-${item.url}`} className="border-b border-border py-3"><ArrowLink href={item.url} external>{item.label}</ArrowLink></li>)}
          </ul>
          {research.collaborators.length ? <div className="mt-8"><p className="type-metadata text-foreground-secondary">COLLABORATORS</p><ul className="mt-3 space-y-2">{research.collaborators.map((person) => <li key={`${person.name}-${person.role ?? ""}`}><span className="font-medium">{person.name}</span>{person.role ? <span className="text-foreground-secondary"> · {person.role}</span> : null}</li>)}</ul></div> : null}
        </div>
      </section> : null}
    </Container>
  </main>;
}
