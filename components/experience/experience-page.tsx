import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import type { PublicExperience, PublicPageSettings } from "@/lib/domain/content";
import { formatDateRange, normalizeLabel } from "@/lib/presentation/content";

const categoryLabels: Record<string, string> = {
  professional: "Professional",
  organization: "Organization",
  organisational: "Organization",
  community: "Community",
  freelance: "Freelance / Project",
  project: "Freelance / Project",
  "freelance-project": "Freelance / Project",
  "freelance-and-project": "Freelance / Project",
};

function category(value: string | null) {
  if (!value) return null;
  return categoryLabels[normalizeLabel(value)] ?? value;
}

export function ExperiencePage({ experiences, pageSettings }: {
  experiences: PublicExperience[]; pageSettings: PublicPageSettings | null;
}) {
  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="02 / EXPERIENCE" title="Experience, contribution, and context."
      introduction={pageSettings?.intro} />
    <Container>
      {experiences.length ? <Timeline>
        {experiences.map((experience, index) => <TimelineItem key={experience.id} current={experience.isCurrent} metadata={<>
              <p className="type-metadata text-foreground-secondary">E.{String(index + 1).padStart(2, "0")}</p>
              <p className="type-metadata mt-3 text-foreground-secondary">{formatDateRange(experience.startDate, experience.endDate, experience.isCurrent)}</p>
              {category(experience.contextLabel) ? <Tag className="mt-5">{category(experience.contextLabel)}</Tag> : null}
            </>}>
          <article className="grid gap-7 lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0">
              <h2 className="text-h3">{experience.roleTitle}</h2>
              <p className="mt-2 text-body-lg text-foreground-secondary">{experience.organizationName}</p>
              {experience.location ? <p className="type-metadata mt-3 text-foreground-secondary">{experience.location}</p> : null}
              {experience.organizationUrl ? <div className="mt-5"><ArrowLink href={experience.organizationUrl} external>Organization</ArrowLink></div> : null}
            </div>
            <div className="min-w-0">
              <p className="max-w-reading text-foreground-secondary">{experience.description}</p>
              {experience.organizationImage ? <MediaRenderer className="mt-7 max-w-sm" image={experience.organizationImage}
                sizes="(min-width: 1024px) 24rem, 60vw" /> : null}
            </div>
          </article>
        </TimelineItem>)}
      </Timeline> : <div className="border-y border-border py-16 md:py-24"><p className="max-w-reading text-body-lg text-foreground-secondary">
        {pageSettings?.emptyStateCopy ?? "No public experience entries are available yet."}</p></div>}
    </Container>
  </main>;
}
