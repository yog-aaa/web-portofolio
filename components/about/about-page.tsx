import type { ReactNode } from "react";
import { SafeMarkdown } from "@/components/content/safe-markdown";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { PageHeader } from "@/components/ui/page-header";
import { Tag } from "@/components/ui/tag";
import type { PublicCredential, PublicPageSettings, PublicProfile, PublicProject } from "@/lib/domain/content";
import { formatDateRange, formatDecimal, formatPreciseDate, uniqueByKey } from "@/lib/presentation/content";

function interests(focusLine: string | null) {
  if (!focusLine) return [];
  return focusLine.split(/\s*[·,|]\s*/).map((item) => item.trim()).filter(Boolean);
}

export function AboutPage({ profile, projects, credentials, pageSettings }: {
  profile: PublicProfile | null; projects: PublicProject[]; credentials: PublicCredential[];
  pageSettings: PublicPageSettings | null;
}) {
  const technologies = uniqueByKey(projects.flatMap((project) => project.technologies));
  const contactLinks = profile?.socialLinks.filter((item) => item.purpose === "contact") ?? [];
  const socialLinks = profile?.socialLinks.filter((item) => item.purpose === "social") ?? [];
  const sections = ["Profile", "Currently", "Background", "Education", "Interests", "Technology", "Credentials", "Contact"];

  return <main id="main-content" className="flex-1 pb-section">
    <PageHeader eyebrow="05 / ABOUT" title={profile?.displayName ?? "About"} introduction={pageSettings?.intro} />
    <Container>
      {!profile ? <div className="border-y border-border py-16 md:py-24"><p className="max-w-reading text-body-lg text-foreground-secondary">
        {pageSettings?.emptyStateCopy ?? "The public profile is not configured yet."}</p></div> : <>
        <section className="editorial-grid border-y border-border py-10 md:py-14" aria-labelledby="about-profile">
          <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">01 / PROFILE</p><h2 id="about-profile" className="mt-3 text-h3">{sections[0]}</h2></div>
          <div className="col-span-full mt-8 lg:col-span-5 lg:col-start-5 lg:mt-0">
            {profile.focusLine ? <p className="text-h2 text-balance">{profile.focusLine}</p> : null}
            {profile.shortBiography ? <p className="mt-6 max-w-reading text-body-lg text-foreground-secondary">{profile.shortBiography}</p> : null}
            {profile.location ? <p className="type-metadata mt-6 text-foreground-secondary">BASED IN {profile.location.toUpperCase()}</p> : null}
          </div>
          {profile.portrait ? <MediaRenderer className="col-span-full mt-8 lg:col-span-3 lg:col-start-10 lg:mt-0"
            image={profile.portrait} sizes="(min-width: 1024px) 22vw, 80vw" priority /> : null}
        </section>

        {profile.availabilityText ? <AboutSection index="02" title={sections[1]}><p className="max-w-reading text-body-lg text-foreground-secondary">{profile.availabilityText}</p></AboutSection> : null}

        {profile.biographyMarkdown ? <AboutSection index="03" title={sections[2]}><SafeMarkdown markdown={profile.biographyMarkdown} /></AboutSection> : null}

        <AboutSection index="04" title={sections[3]}>
          {profile.education.length ? <ol className="border-t border-border">{profile.education.map((item) => <li key={item.id} className="border-b border-border py-6">
            <p className="type-metadata text-foreground-secondary">{formatDateRange(item.startDate, item.endDate, item.isCurrent ?? false)}</p>
            <h3 className="mt-3 text-h3">{item.qualificationOrProgram}</h3>
            <p className="mt-1 text-foreground-secondary">{item.institutionName}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}</p>
            {item.description ? <p className="mt-4 max-w-reading text-foreground-secondary">{item.description}</p> : null}
            {item.gpaValue && item.gpaScale ? <p className="type-metadata mt-4 text-foreground-secondary">GPA {formatDecimal(item.gpaValue)} / {formatDecimal(item.gpaScale)}</p> : null}
            {item.institutionUrl ? <div className="mt-4"><ArrowLink href={item.institutionUrl} external>Institution</ArrowLink></div> : null}
          </li>)}</ol> : <p className="text-foreground-secondary">No public education entries are available.</p>}
        </AboutSection>

        <AboutSection index="05" title={sections[4]}>
          {interests(profile.focusLine).length ? <div className="flex flex-wrap gap-2">{interests(profile.focusLine).map((item) => <Tag key={item}>{item}</Tag>)}</div>
            : <p className="text-foreground-secondary">No public interests are listed.</p>}
        </AboutSection>

        <AboutSection index="06" title={sections[5]}>
          {technologies.length ? <div className="flex flex-wrap gap-2">{technologies.map((item) => <Tag key={item.key}>{item.name}</Tag>)}</div>
            : <p className="text-foreground-secondary">Technologies will appear here with published work.</p>}
        </AboutSection>

        <AboutSection index="07" title={sections[6]}>
          {credentials.length ? <ol className="border-t border-border">{credentials.slice(0, 3).map((item) => <li key={item.id} className="grid gap-2 border-b border-border py-5 md:grid-cols-[1fr_auto] md:items-start">
            <div><h3 className="font-medium">{item.title}</h3><p className="text-foreground-secondary">{item.issuerName}</p></div>
            {formatPreciseDate(item.issueDate) ? <p className="type-metadata text-foreground-secondary">{formatPreciseDate(item.issueDate)}</p> : null}
          </li>)}</ol> : <p className="text-foreground-secondary">No public credentials are listed yet.</p>}
          <div className="mt-6"><ArrowLink href="/credentials">View credentials</ArrowLink></div>
        </AboutSection>

        <AboutSection index="08" title={sections[7]}>
          {contactLinks.length || socialLinks.length ? <div className="grid gap-8 md:grid-cols-2">
            {contactLinks.length ? <div><p className="type-metadata mb-3 text-foreground-secondary">CONTACT</p><ul>{contactLinks.map((item) => <li key={item.id}><ArrowLink href={item.destination}>{item.label}</ArrowLink></li>)}</ul></div> : null}
            {socialLinks.length ? <div><p className="type-metadata mb-3 text-foreground-secondary">ELSEWHERE</p><ul>{socialLinks.map((item) => <li key={item.id}><ArrowLink href={item.destination}>{item.label}</ArrowLink></li>)}</ul></div> : null}
          </div> : <p className="text-foreground-secondary">Public contact details have not been added yet.</p>}
        </AboutSection>
      </>}
    </Container>
  </main>;
}

function AboutSection({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return <section className="editorial-grid border-b border-border py-10 md:py-14" aria-labelledby={`about-${index}`}>
    <div className="col-span-full lg:col-span-3"><p className="type-metadata text-foreground-secondary">{index}</p><h2 id={`about-${index}`} className="mt-3 text-h3">{title}</h2></div>
    <div className="col-span-full mt-7 min-w-0 lg:col-span-8 lg:col-start-5 lg:mt-0">{children}</div>
  </section>;
}
