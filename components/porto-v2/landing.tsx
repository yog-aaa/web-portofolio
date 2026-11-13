import Image from "next/image";
import Link from "next/link";
import { LandingInteractions, LandingIntro, ThemeToggle } from "./interactions";
import { getHomePageContent, getPublicExperiences, getPublicProjects, getPublicSite, pickFeaturedProject } from "@/lib/porto-v2/content";

function Arrow({ direction = "up" }: { direction?: "up" | "down" }) {
  return <span aria-hidden="true">{direction === "up" ? "↗" : "↓"}</span>;
}

async function Brand() {
  const site = await getPublicSite();
  return <a className="v2-brand" href="#top" aria-label="YOGAAA. — back to top">
    <Image src={site.brandMarkUrl} alt="" width={24} height={24} />
    <span>YOGAAA.</span>
  </a>;
}

function Header() {
  return <header className="v2-header">
    <Brand />
    <nav className="v2-nav" aria-label="Primary navigation">
      <a href="#selected-work">Work</a><a href="#experience">Experience</a>
      <Link href="/research">Research</Link><Link href="/thoughts">Thoughts</Link><Link href="/about">About</Link>
    </nav>
    <div className="v2-header-actions"><ThemeToggle /><LandingInteractions /></div>
  </header>;
}

async function Hero() {
  const site = await getPublicSite();
  return <section className="v2-hero" aria-labelledby="hero-heading">
    <div className="v2-hero-stage">
      <div className="v2-hero-watermark" aria-hidden="true">YOGAAA.</div>
      <div className="v2-hero-glow" aria-hidden="true" />
      <div className="v2-hero-copy">
        <p className="v2-eyebrow">PORTFOLIO&nbsp; / &nbsp;2026</p>
        <h1 id="hero-heading">YOGA<span>AGUSTIANSYAH.</span></h1>
        <p className="v2-hero-role">SOFTWARE DEVELOPER &amp;<br />AI EXPLORER</p>
        <p className="v2-hero-description">{site.headline}</p>
        <a className="v2-button v2-button-primary v2-hero-cta" href="#selected-work">EXPLORE MY WORK <Arrow /></a>
      </div>
      <div className="v2-portrait-wrap">
        <Image className="v2-portrait" src={site.portraitUrl} alt="Portrait of Yoga Agustiansyah" width={1086} height={1450} priority sizes="(max-width: 600px) 85vw, (max-width: 900px) 55vw, 42vw" />
      </div>
      <aside className="v2-hero-aside" aria-label="Portfolio at a glance">
        <p className="v2-aside-label">IN NUMBERS</p>
        <div className="v2-stat"><strong>{String(site.completedProjectsCount).padStart(2, "0")}</strong><span>PROJECTS<br />COMPLETED</span></div>
        <div className="v2-stat"><strong>{String(site.teamsAndClientsCount).padStart(2, "0")}</strong><span>TEAMS + CLIENTS<br />WORKED WITH</span></div>
        <a className="v2-collab" href={site.linkedin} target="_blank" rel="noreferrer">LET&apos;S COLLABORATE <Arrow /></a>
        <a className="v2-scroll-cue" href="#selected-work"><Arrow direction="down" /> SCROLL TO EXPLORE</a>
      </aside>
    </div>
    <div className="v2-hero-bottom"><span><b aria-hidden="true">◉</b> SELECTED WORK</span><span>SCROLL TO DISCOVER</span><span>HOME / 01</span></div>
  </section>;
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow?: string; title: string; description: string; id: string }) {
  return <div className="v2-section-head">{eyebrow && <p className="v2-eyebrow">{eyebrow}</p>}<h2 id={id}>{title}</h2><p>{description}</p></div>;
}

async function Work() {
  const projects = await getPublicProjects();
  const page = await getHomePageContent();
  const featured = pickFeaturedProject(projects);
  if (!featured) return null;
  const secondary = projects.filter(project => project.slug !== featured.slug).slice(0, 2);
  const projectIcons: Record<string, string> = {"aisnet-mobile": "/porto-v2/aisnet-icon.png", "reyyaid-top-up": "/porto-v2/reyy-icon.png"};
  return <section id="selected-work" className="v2-section v2-work" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title={page?.workHeading ?? "What I've built."} description="A selection of products I've built with teams across education, campus life, and commerce." />
    <Link className="v2-featured" href={`/work/${featured.slug}`} aria-label={`View ${featured.title} case study`}>
      <div className="v2-featured-copy"><p className="v2-eyebrow">FEATURED PROJECT</p><h3>{featured.title}</h3><p>{featured.subtitle}</p><div className="v2-tags"><span>{featured.role.toUpperCase()}</span><span>{featured.category.toUpperCase()}</span></div><span className="v2-featured-action">VIEW CASE STUDY <Arrow /></span></div>
      <div className="v2-featured-art"><span aria-hidden="true">{featured.title.split(" ")[0].toUpperCase()}</span><Image src={featured.visual} alt={featured.alt} width={1792} height={850} sizes="(max-width: 700px) 75vw, 45vw" /></div>
    </Link>
    {secondary.length > 0 && <div className="v2-work-subhead">MORE PROJECTS <span>/ {String(secondary.length).padStart(2, "0")}</span></div>}
    <div className="v2-project-grid">
      {secondary.map((project, index) => <Link className="v2-project" href={`/work/${project.slug}`} key={project.slug} aria-label={`View ${project.title} project`}><Image src={project.visual} alt={project.alt} width={1024} height={500} sizes="(max-width: 700px) 40vw, 35vw" /><div><p className="v2-project-index">0{index + 1}</p><div className="v2-project-identity">{projectIcons[project.slug] ? <Image src={projectIcons[project.slug]} alt="" width={38} height={38} /> : <span className="v2-project-monogram" aria-hidden="true">{project.title.slice(0, 1)}</span>}<h3>{project.title}</h3></div><p>{project.subtitle}</p><div className="v2-project-bottom"><span>{project.category.toUpperCase()}</span><span className="v2-project-action">VIEW PROJECT <Arrow /></span></div></div></Link>)}
    </div>
    <Link className="v2-outline-link" href="/work">VIEW ALL PROJECTS <Arrow /></Link>
  </section>;
}

async function Experience() {
  const experiences = await getPublicExperiences();
  const page = await getHomePageContent();
  const lead = experiences.find(item => item.id === "itg") ?? experiences[0];
  if (!lead) return null;
  const others = experiences.filter(item => item.id !== lead.id).slice(0, 2);
  return <section id="experience" className="v2-section v2-experience" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" eyebrow="EXPERIENCE & COLLABORATION" title={page?.experienceHeading ?? "The teams behind the work."} description="The organizations where I build software, coordinate teams, and work with people." />
    <div className="v2-experience-grid">
      <article className="v2-experience-lead"><div className="v2-org-mark"><Image src={lead.image} alt="" width={72} height={72} /><span aria-hidden="true">{lead.id.toUpperCase()}</span></div><p className="v2-eyebrow">FEATURED ROLE</p><h3>{lead.name}</h3><p className="v2-experience-role">{lead.role.toUpperCase()}</p><p className="v2-experience-date">{lead.date}</p><p>{lead.text}</p>{lead.links[0] && <a href={lead.links[0][1]} target="_blank" rel="noreferrer">{lead.links[0][0]} <Arrow /></a>}</article>
      <div className="v2-experience-list">{others.map(item => <article key={item.id}><div className="v2-org-mini"><Image src={item.image} alt="" width={72} height={72} /><div><h3>{item.name}</h3><p>{item.role.toUpperCase()}</p></div><time>{item.date}</time></div><p>{item.text}</p>{item.links[0] && <a href={item.links[0][1]} target="_blank" rel="noreferrer">{item.links[0][0]} <Arrow /></a>}</article>)}</div>
    </div>
    <div className="v2-experience-foot"><p>Earlier roles, community work, and teaching continue in the full timeline.</p><Link className="v2-outline-link" href="/experience">VIEW ALL EXPERIENCE <Arrow /></Link></div>
  </section>;
}

const learning = [
  { label: "UI/UX DESIGN", title: "Designing for people.", body: "I often build interfaces without a finished design. I'm studying usability, information hierarchy, and interaction design so the features I deliver feel clear and comfortable to use." },
  { label: "AI AGENTS & ORCHESTRATION", title: "Directing AI systems.", body: "I'm moving beyond chat-based coding help to learn agent design, orchestration, controls, and MCP—and how to make AI assistance useful in real workflows." },
  { label: "SYSTEM ANALYSIS", title: "Seeing the whole system.", body: "I'm learning to map requirements, system flows, and security risks before implementation, then guide and review the work AI helps produce." },
];

async function Learning() {
  const page = await getHomePageContent();
  const items = page?.learning ?? learning;
  return <section className="v2-learning" aria-labelledby="learning-heading"><div className="v2-section">
    <SectionHeading id="learning-heading" title={page?.learningHeading ?? "What I'm learning now."} description="Frontend is my home base. I'm widening how I think about the people, systems, and tools behind each product." />
    <div className="v2-learning-list">{items.map((item, index) => <article key={item.label} className="v2-learning-row"><span className="v2-learning-index">0{index + 1}</span><div><p className="v2-eyebrow">{item.label}</p><h3>{item.title}</h3></div><p>{item.body}</p></article>)}</div>
    <div className="v2-next-up"><div><p className="v2-eyebrow">NEXT UP</p><h3>{page?.nextUp.title ?? "DevOps & server operations."}</h3></div><p>{page?.nextUp.body ?? "I plan to learn deployment, server management, and maintenance so I understand what happens after a product ships."}</p></div>
  </div></section>;
}

async function Closing() {
  const site = await getPublicSite();
  return <><section className="v2-closing v2-section" aria-labelledby="closing-heading"><div className="v2-closing-panel"><div className="v2-closing-main"><p className="v2-eyebrow">LET&apos;S COLLABORATE</p><h2 id="closing-heading">Let&apos;s make<br />something useful.</h2><p>For product work, frontend delivery, or a thoughtful collaboration—tell me what you&apos;re building.</p><a className="v2-button v2-button-primary" href={site.linkedin} target="_blank" rel="noreferrer">START A CONVERSATION <Arrow /></a></div><div className="v2-closing-links"><p className="v2-eyebrow">EXPLORE FURTHER</p><Link href="/about"><strong>About</strong><span>The person behind the work.</span><Arrow /></Link><Link href="/research"><strong>Research</strong><span>Investigations and experiments.</span><Arrow /></Link><Link href="/thoughts"><strong>Thoughts</strong><span>Notes from building and learning.</span><Arrow /></Link></div></div></section><footer className="v2-footer"><Brand /><a href={`mailto:${site.email}`}>{site.email} <Arrow /></a><a href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a><a href={site.instagram} target="_blank" rel="noreferrer">Instagram · @yoga0_120 <Arrow /></a><a href="#top">BACK TO TOP ↑</a></footer></>;
}

export function PortoLanding() {
  return <div className="porto-v2" id="top"><LandingIntro /><div className="v2-page"><span className="v2-skip"><a href="#main-content">Skip to content</a></span><Header /><main id="main-content"><Hero /><Work /><Experience /><Learning /><Closing /></main></div></div>;
}
