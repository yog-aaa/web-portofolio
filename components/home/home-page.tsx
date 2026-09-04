import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import type { PublicExperience, PublicProfile, PublicProject, PublicResearch,
  PublicSiteSettings, PublicThought } from "@/lib/domain/content";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { MediaRenderer } from "@/components/ui/media-renderer";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import { SocialLinks } from "@/components/ui/social-links";

type WorkFeature = { kind: "project"; item: PublicProject } | { kind: "research"; item: PublicResearch };
const period = (start: string | null, end: string | null) => [start, end].filter(Boolean).join(" — ");

function TechnicalField() {
  return <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[30rem] overflow-hidden">
    <div className="absolute inset-[12%] rounded-full border border-border" />
    <div className="absolute inset-[28%] rounded-full border border-accent-secondary" />
    <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
    <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
    <div className="absolute left-[28%] top-[28%] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    <div className="absolute bottom-[12%] right-1/2 h-[38%] w-px rotate-45 origin-bottom bg-accent-secondary" />
    <span className="type-metadata absolute right-0 top-1/2 -translate-y-1/2 text-muted">01</span>
    <span className="type-metadata absolute bottom-0 left-1/2 -translate-x-1/2 text-muted">Y/A</span>
  </div>;
}

function HeroAction({ href, children, secondary = false }: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  const className = `group transition-interactive inline-flex min-h-target items-center justify-center gap-3 rounded-control border px-5 py-3 font-medium ${secondary
    ? "border-border-control bg-transparent text-foreground hover:border-accent-deep hover:bg-surface"
    : "border-accent bg-accent text-accent-foreground hover:border-accent-deep hover:bg-accent-deep"}`;
  const content = <>{children}<span aria-hidden="true" className="transition-transform duration-(--duration-fast) ease-calm group-hover:translate-x-0.5">{href.startsWith("#") ? "↓" : "↗"}</span></>;
  return /^(https?:|mailto:)/.test(href) ? <a href={href} className={className} rel={href.startsWith("http") ? "noreferrer" : undefined}>{content}</a>
    : <Link href={href} className={className}>{content}</Link>;
}

function HeroPortrait({ image }: { image: NonNullable<PublicProfile["portrait"]> }) {
  const portrait = image.height / image.width > 1.12;
  return <figure className={`relative mx-auto w-full ${portrait ? "max-w-[22rem]" : "max-w-[27rem]"}`}>
    <div aria-hidden="true" className="absolute -inset-x-3 inset-y-6 border border-accent-soft" />
    <div aria-hidden="true" className="absolute -bottom-3 left-6 right-0 top-6 bg-accent-soft" />
    <div className="relative border border-border-control bg-surface p-2.5">
      <div className="relative overflow-hidden bg-accent-very-soft">
        <MediaImage image={image} sizes="(min-width: 1280px) 28vw, (min-width: 768px) 34vw, 86vw"
          priority className="h-auto w-full object-cover" />
        <span aria-hidden="true" className="absolute left-3 top-3 size-4 border-l border-t border-accent-foreground/80" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 size-4 border-b border-r border-accent-foreground/80" />
      </div>
    </div>
    <figcaption className="type-metadata relative mt-4 flex items-center justify-between gap-4 text-foreground-secondary">
      <span>PORTRAIT / YOGAAA.</span><span>{image.width} × {image.height}</span>
    </figcaption>
  </figure>;
}

function WorkSection({ feature, settings }: { feature: WorkFeature; settings: PublicSiteSettings }) {
  const item = feature.item;
  const copy = settings.sectionCopy.selectedWork;
  if (!copy?.heading) return null;
  const href = feature.kind === "project" ? `/work/${item.slug}` : `/research/${item.slug}`;
  const media = item.cover;
  const tags = feature.kind === "project" ? [...feature.item.categories, ...feature.item.technologies] : feature.item.technologies;
  return <section id="selected-work" className="scroll-mt-24 pb-section" aria-labelledby="selected-work-title">
    <Container>
      <SectionHeader index="01 / WORK" heading={copy.heading} headingId="selected-work-title" intro={copy.intro} href="/work" actionLabel={copy.actionLabel} />
      <Divider />
      <article className="editorial-grid py-10 md:py-14 lg:py-16">
        <div className="col-span-full lg:col-span-7">
          {media ? <MediaRenderer image={media.image} caption={media.caption} priority sizes="(min-width: 1024px) 58vw, 100vw" />
            : <div aria-hidden="true" className="aspect-[16/10] overflow-hidden rounded-media bg-accent-very-soft p-5">
              <div className="h-full border border-accent-soft bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            </div>}
        </div>
        <div className="col-span-full mt-8 flex min-w-0 flex-col lg:col-span-5 lg:mt-0 lg:pl-4">
          <p className="type-metadata text-foreground-secondary">FEATURED / {feature.kind.toUpperCase()}</p>
          <h3 className="mt-5 text-h2 text-balance"><Link href={href} className="hover:underline hover:underline-offset-4">{item.title}</Link></h3>
          <p className="mt-5 max-w-reading text-body-lg text-foreground-secondary">{item.summary}</p>
          {tags.length ? <div className="mt-8 flex flex-wrap gap-2">{tags.map((tag) => <Tag key={`${tag.key}-${tag.name}`}>{tag.name}</Tag>)}</div> : null}
          <div className="mt-auto pt-8"><ArrowLink href={href}>{settings.heroExploreLabel ?? item.title}</ArrowLink></div>
        </div>
      </article>
      <Divider />
    </Container>
  </section>;
}

export function HomePage({ settings, profile, projects, experience, research, thoughts }:
  { settings: PublicSiteSettings | null; profile: PublicProfile | null; projects: PublicProject[];
    experience: PublicExperience | null; research: PublicResearch[]; thoughts: PublicThought[] }) {
  if (!settings && !profile) return <main id="main-content" className="flex flex-1 items-center"><Container><p className="text-body-lg text-foreground-secondary">Public content is not configured yet.</p></Container></main>;
  const feature: WorkFeature | null = projects[0] ? { kind: "project", item: projects[0] }
    : research[0] ? { kind: "research", item: research[0] } : null;
  const remainingResearch = feature?.kind === "research" ? research.slice(1) : research;
  const contact = profile?.socialLinks.find((item) => item.purpose === "contact");
  const socialProfiles = profile?.socialLinks.filter((item) => item.purpose === "social") ?? [];

  return <main id="main-content" className="flex-1">
    <section className="relative overflow-hidden pb-section pt-8 md:pt-14 lg:min-h-[calc(100svh-5rem)] lg:pt-16" aria-labelledby="home-title">
      <Container className="editorial-grid min-h-full items-center">
        <div className="col-span-full pb-12 md:col-span-5 lg:col-span-7 lg:pb-20">
          {settings?.heroSupportingCopy || profile?.focusLine ? <p className="type-metadata mb-7 text-accent-deep">{settings?.heroSupportingCopy ?? profile?.focusLine}</p> : null}
          <h1 id="home-title" className="max-w-[13ch] text-display uppercase text-balance">{settings?.heroHeadline ?? profile?.displayName}</h1>
          {settings?.heroIntro || profile?.shortBiography ? <p className="mt-8 max-w-reading text-body-lg text-foreground-secondary">{settings?.heroIntro ?? profile?.shortBiography}</p> : null}
          {settings?.heroExploreLabel || (contact && settings?.contactCtaLabel) ? <div className="mt-9 flex flex-wrap gap-3">
            {settings?.heroExploreLabel ? <HeroAction href={feature ? "#selected-work" : "/work"}>{settings.heroExploreLabel}</HeroAction> : null}
            {contact && settings?.contactCtaLabel ? <HeroAction href={contact.destination} secondary>{settings.contactCtaLabel}</HeroAction> : null}
          </div> : null}
        </div>
        <div className="col-span-full pb-10 md:col-span-3 lg:col-span-5 lg:pb-14">
          {profile?.portrait ? <HeroPortrait image={profile.portrait} /> : <TechnicalField />}
        </div>
      </Container>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </section>

    {feature && settings ? <WorkSection feature={feature} settings={settings} /> : null}

    {experience && settings?.sectionCopy.experienceHighlight?.heading ? <section className="pb-section" aria-labelledby="experience-title">
      <Container>
        <SectionHeader index="02 / EXPERIENCE" heading={settings.sectionCopy.experienceHighlight.heading} headingId="experience-title"
          intro={settings.sectionCopy.experienceHighlight.intro} href="/experience" actionLabel={settings.sectionCopy.experienceHighlight.actionLabel} />
        <article className="editorial-grid border-y border-border py-8 md:py-10">
          <p className="type-metadata col-span-full text-foreground-secondary md:col-span-2 lg:col-span-3">{period(experience.startDate, experience.isCurrent ? "Present" : experience.endDate)}</p>
          <div className="col-span-full mt-5 md:col-span-6 md:mt-0 lg:col-span-4"><h3 className="text-h3">{experience.roleTitle}</h3><p className="mt-1 text-foreground-secondary">{experience.organizationName}</p></div>
          <p className="col-span-full mt-5 text-foreground-secondary md:col-span-6 md:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-0">{experience.description}</p>
        </article>
      </Container>
    </section> : null}

    {remainingResearch.length && settings?.sectionCopy.featuredResearch?.heading ? <section className="pb-section" aria-labelledby="research-title">
      <Container>
        <SectionHeader index="03 / RESEARCH" heading={settings.sectionCopy.featuredResearch.heading} headingId="research-title"
          intro={settings.sectionCopy.featuredResearch.intro} href="/research" actionLabel={settings.sectionCopy.featuredResearch.actionLabel} />
        <div className="border-t border-border">{remainingResearch.map((item, index) => <article key={item.id} className="editorial-grid border-b border-border py-8 md:py-10">
          <p className="type-metadata col-span-2 text-foreground-secondary">R.{String(index + 1).padStart(2, "0")}</p>
          <div className="col-span-full mt-5 md:col-span-6 md:mt-0 lg:col-span-5"><h3 className="text-h3"><Link href={`/research/${item.slug}`} className="hover:underline hover:underline-offset-4">{item.title}</Link></h3><p className="type-metadata mt-3 text-foreground-secondary">{item.researchType}</p></div>
          <p className="col-span-full mt-5 text-foreground-secondary md:col-span-6 md:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-0">{item.summary}</p>
        </article>)}</div>
      </Container>
    </section> : null}

    {thoughts.length && settings?.sectionCopy.latestThoughts?.heading ? <section className="bg-surface py-section" aria-labelledby="thoughts-title">
      <Container>
        <SectionHeader index="04 / THOUGHTS" heading={settings.sectionCopy.latestThoughts.heading} headingId="thoughts-title"
          intro={settings.sectionCopy.latestThoughts.intro} href="/thoughts" actionLabel={settings.sectionCopy.latestThoughts.actionLabel} />
        <ol className="border-t border-border">{thoughts.map((item, index) => <li key={item.id} className="border-b border-border">
          <Link href={`/thoughts/${item.slug}`} className="editorial-grid group py-7 md:py-9">
            <span className="type-metadata col-span-2 text-foreground-secondary">{String(index + 1).padStart(2, "0")}</span>
            <span className="col-span-full mt-4 text-h3 group-hover:underline group-hover:underline-offset-4 md:col-span-4 md:mt-0 lg:col-span-6">{item.title}</span>
            <span className="col-span-full mt-3 text-caption text-foreground-secondary md:col-span-2 md:mt-0 lg:col-span-4">{item.excerpt}</span>
          </Link>
        </li>)}</ol>
      </Container>
    </section> : null}

    {profile && settings?.sectionCopy.shortAbout?.heading ? <section className="py-section" aria-labelledby="about-title">
      <Container>
        <SectionHeader index="05 / ABOUT" heading={settings.sectionCopy.shortAbout.heading} headingId="about-title"
          intro={settings.sectionCopy.shortAbout.intro} href="/about" actionLabel={settings.sectionCopy.shortAbout.actionLabel} />
        <div className="editorial-grid border-y border-border py-10 md:py-14">
          <div className="col-span-full lg:col-span-7"><h3 className="max-w-[18ch] text-h2 text-balance">{profile.focusLine ?? profile.displayName}</h3>{profile.shortBiography ? <p className="mt-6 max-w-reading text-body-lg text-foreground-secondary">{profile.shortBiography}</p> : null}</div>
          <div className="col-span-full mt-10 lg:col-span-5 lg:mt-0">{profile.education.map((item) => <div key={item.id} className="border-t border-border py-5 first:border-t-0 first:pt-0"><p className="type-metadata text-foreground-secondary">{period(item.startDate, item.endDate)}</p><p className="mt-2 font-medium">{item.qualificationOrProgram}</p><p className="text-foreground-secondary">{item.institutionName}</p></div>)}</div>
        </div>
      </Container>
    </section> : null}

    {contact && settings?.contactCtaHeading && settings.contactCtaLabel ? <section className="bg-accent-deep py-section text-accent-foreground" aria-labelledby="contact-title">
      <Container className="editorial-grid items-end">
        <p className="type-metadata col-span-full text-accent-soft lg:col-span-3">06 / {settings.sectionCopy.contact?.heading ?? settings.contactCtaLabel}</p>
        <div className="col-span-full mt-8 lg:col-span-7 lg:mt-0"><h2 id="contact-title" className="text-h2 text-balance">{settings.contactCtaHeading}</h2>{settings.contactSupportingCopy ? <p className="mt-5 max-w-reading text-body-lg text-accent-soft">{settings.contactSupportingCopy}</p> : null}</div>
        <div className="col-span-full mt-8 lg:col-span-2 lg:text-right"><a href={contact.destination} className="inline-flex min-h-target items-center border-b border-accent-soft font-medium">{settings.contactCtaLabel}<span className="ml-2" aria-hidden="true">↗</span></a></div>
        {socialProfiles.length ? <div className="col-span-full mt-7 lg:col-start-4"><SocialLinks links={socialProfiles} tone="inverse" /></div> : null}
      </Container>
    </section> : null}
  </main>;
}
