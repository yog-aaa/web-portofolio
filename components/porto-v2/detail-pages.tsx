import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./interactions";
import { PublicMotion } from "./public-motion";
import { DetailMenu } from "./detail-menu";
import { getPublicCredentialGroups, getPublicCredentials, getPublicEducation, getPublicExperiences, getPublicProjects, getPublicSite, pickFeaturedProject } from "@/lib/porto-v2/content";
import "./landing.css";
import "./detail.css";

const linkedin = "https://www.linkedin.com/in/yoga-agustiansyah/";

export async function DetailShell({ children }: { children: React.ReactNode }) {
  const site = await getPublicSite();
  return <div className="porto-v2 v2-detail" id="top"><PublicMotion /><div className="v2-page"><a className="v2-detail-skip" href="#main-content">Skip to content</a><header className="v2-header"><Link className="v2-brand" href="/" aria-label="YOGAAA. — Home"><Image src={site.brandMarkUrl} alt="" width={24} height={24} /><span>YOGAAA.</span></Link><nav className="v2-nav" aria-label="Primary navigation"><Link href="/work">Work</Link><Link href="/experience">Experience</Link><Link href="/research">Research</Link><Link href="/thoughts">Thoughts</Link><Link href="/about">About</Link></nav><div className="v2-header-actions"><ThemeToggle /><DetailMenu /></div></header><main id="main-content" className="v2-detail-main">{children}</main><footer className="v2-detail-footer"><Link href="/">YOGAAA.</Link><a href={`mailto:${site.email}`}>EMAIL ↗</a><a href={site.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a><Link href="/">BACK TO HOME ↗</Link></footer></div></div>;
}

function Crumb({ current }: { current: string }) { return <div className="v2-crumb"><Link href="/">HOME</Link><span>/</span><span>{current}</span></div>; }
function PageLead({ crumb, title, intro }: { crumb: string; title: React.ReactNode; intro: string }) { return <div className="v2-page-lead"><Crumb current={crumb} /><h1>{title}</h1><p>{intro}</p></div>; }
function BackHome() { return <div className="v2-detail-end"><Link href="/">BACK TO HOME ↗</Link></div>; }

export async function WorkPage() {
  const projects = await getPublicProjects();
  const featured = pickFeaturedProject(projects);
  const others = projects.filter(project => project.slug !== featured?.slug);
  return <DetailShell><PageLead crumb="WORK" title="Work, in context." intro="A closer look at the products, teams, and decisions behind the work." /><section className="v2-work-index" aria-label="Selected projects"><div className="v2-work-label">SELECTED / 01</div>{featured && <Link className="v2-work-hero" data-motion-stage="0.55" href={`/work/${featured.slug}`}><div><p className="v2-eyebrow">{featured.category}</p><h2>{featured.title}</h2><p>{featured.subtitle}</p><span>VIEW CASE STUDY ↗</span></div><div className="v2-work-hero-art"><Image data-motion-plane src={featured.visual} alt={featured.alt} width={1792} height={850} sizes="(max-width: 700px) 90vw, 46vw" /></div></Link>}<div className="v2-work-label v2-work-label-secondary">MORE PRODUCTS</div><div className="v2-work-index-list">{others.map(project => <Link className="v2-work-index-row" href={`/work/${project.slug}`} key={project.slug}><div><p className="v2-eyebrow">{project.category}</p><h2>{project.title}</h2><p>{project.subtitle}</p><span>VIEW THE STORY ↗</span></div><Image src={project.visual} alt={project.alt} width={1024} height={500} sizes="(max-width: 700px) 90vw, 44vw" /></Link>)}</div></section><section className="v2-ledger"><h2>Elsewhere in the work.</h2><p>Other systems and tools I contributed to. Their individual stories can expand as material is added.</p>{[["DIGITAK Project Management", "FRONTEND / COMPLETED"], ["ITG Archive & Correspondence", "APPLICATION DEVELOPMENT / COMPLETED"], ["Sakode QR Code Generator", "ACADEMY PLATFORM / COMPLETED"], ["ITG IT Ticketing Portal", "APPLICATION DEVELOPMENT / IN PROGRESS"]].map(([title, status]) => <div className="v2-ledger-row" key={title}><span>{title}</span><span>{status}</span></div>)}</section><BackHome /></DetailShell>;
}

export async function CaseStudyPage({ slug }: { slug: string }) {
  const projects = await getPublicProjects();
  const project = projects.find(item => item.slug === slug);
  if (!project) return null;
  return <DetailShell><Link className="v2-all-work" href="/work">← ALL WORK</Link><section className="v2-case-lead"><p className="v2-eyebrow">{project.category}</p><h1>{project.title.split(" ").map((word, i) => <span key={i}>{word}</span>)}</h1><p>{project.subtitle}</p></section><dl className="v2-case-meta"><div><dt>ROLE</dt><dd>{project.role}</dd></div><div><dt>TEAM</dt><dd>{project.team}</dd></div><div><dt>SURFACE</dt><dd>{project.surface}</dd></div><div><dt>STATUS</dt><dd>{project.projectPhase === "in-progress" ? "In progress" : "Completed"}</dd></div></dl><figure className="v2-case-visual"><div><Image src={project.visual} alt={project.alt} width={1792} height={850} sizes="(max-width: 700px) 90vw, 85vw" /></div><figcaption>{project.caption}</figcaption></figure><section className="v2-case-story"><h2>The work.</h2>{project.sections.map(([heading, body], i) => <div className="v2-case-story-row" key={heading}><span>0{i + 1}</span><h3>{heading}</h3><p>{body}</p></div>)}</section><div className="v2-detail-end">{project.external && <a href={project.external} target="_blank" rel="noreferrer">VISIT PROJECT ↗</a>}<Link href="/work">BACK TO ALL WORK ↗</Link><span>{String(projects.findIndex(item => item.slug === slug) + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span></div></DetailShell>;
}

export async function ExperiencePage() {
  const experience = await getPublicExperiences();
  return <DetailShell><PageLead crumb="EXPERIENCE" title="Where the work happens." intro="Teams, products, and responsibilities across engineering, education, and community work." /><section className="v2-full-experience" aria-label="Experience"><div className="v2-work-label">ROLES & COLLABORATIONS</div>{experience.map(entry => <article className="v2-full-experience-row" key={entry.name}><div className="v2-org-logo">{entry.image ? <Image src={entry.image} alt="" width={82} height={82} /> : <span>AW</span>}</div><div><h2>{entry.name}</h2><p className="v2-experience-position">{entry.role}</p><p>{entry.text}</p><div className="v2-entry-links">{entry.links.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div></div><time>{entry.date}</time></article>)}</section><section className="v2-outside"><h2>Outside delivery.</h2><p>Google Student Ambassador, Dicoding Community Builder, BEM, and teaching-assistant work have also shaped how I learn and collaborate.</p></section><BackHome /></DetailShell>;
}

export async function AboutPage() {
  const site = await getPublicSite();
  const [education] = await getPublicEducation();
  const credentials = await getPublicCredentials();
  return <DetailShell><Crumb current="ABOUT" />
    <section className="v2-about-lead"><div><h1>Making useful things with other people.</h1><p>I am Yoga Agustiansyah. I build frontend and mobile software, lead small teams, and keep learning how products can work better for the people using them.</p></div><div className="v2-about-portrait"><Image src={site.portraitUrl} alt="Portrait of Yoga Agustiansyah" width={1086} height={1450} sizes="(max-width: 700px) 90vw, 40vw" /></div></section>
    <section className="v2-about-practices"><p className="v2-eyebrow">WHAT I DO NOW</p>{[["Build", "I work on web and mobile applications at ITG, usually where interface quality and implementation meet."], ["Lead", "At Puru and Sakode, I coordinate people across disciplines and still contribute directly to the product."], ["Learn", "I study UI/UX, AI agents and orchestration, systems analysis, and the foundations of DevOps and server operations."]].map(([title, body]) => <div key={title}><h2>{title}</h2><p>{body}</p></div>)}</section>
    <section className="v2-about-records" id="education"><p className="v2-eyebrow">EDUCATION & CREDENTIALS</p><div className="v2-about-record-grid"><div className="v2-about-education"><h2>Education</h2><p className="v2-eyebrow">2022 — 2026</p><h3>{education?.program} · {education?.degree}</h3><p>{education?.institution}</p><p>{education?.focus.join(" · ")}</p><p className="v2-eyebrow">GPA {education?.gpa}</p></div><div className="v2-about-credentials"><h2>Credentials</h2>{credentials.filter(item => item.title === "IT Specialist — Data Analytics" || item.title === "EnglishScore").map(item => <div className="v2-about-credential" key={item.title}><strong>{item.title}</strong><span>{item.issuer}</span>{item.href && <a href={item.href} target="_blank" rel="noreferrer">VERIFY CREDENTIAL ↗</a>}</div>)}<p className="v2-eyebrow">PUBLIC RECORDS</p><div className="v2-about-record-links"><a href="https://www.credly.com/users/yoga-agustiansyah/badges/credly" target="_blank" rel="noreferrer">Credly ↗</a><a href="https://learn.microsoft.com/en-us/users/yogaagustiansyah-1326/" target="_blank" rel="noreferrer">Microsoft Learn ↗</a><a href="https://www.credential.net/profile/yogaagustiansyah302871/wallet" target="_blank" rel="noreferrer">Accredible ↗</a><a href="https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154" target="_blank" rel="noreferrer">Google Skills ↗</a><a href="https://drive.google.com/drive/folders/1gFloxduPbQOUbUah_89M731AWmMwgxEc?usp=sharing" target="_blank" rel="noreferrer">Certificate archive ↗</a></div><Link className="v2-about-all-credentials" href="/credentials">VIEW ALL CREDENTIALS ↗</Link></div></div></section>
    <div className="v2-about-cta"><h2>The next useful question.</h2><p>Before writing code, I want to understand the people, the flow, and the system around the feature. That is the direction I am growing toward.</p><a href={linkedin} target="_blank" rel="noreferrer">START A CONVERSATION ↗</a></div><BackHome />
  </DetailShell>;
}

export async function CredentialsPage() {
  const credentialGroups = await getPublicCredentialGroups();
  const groupMeta: Record<string, [string, string, string]> = {
    "CERTIFICATIONS & ASSESSMENT": ["ISSUED CREDENTIALS", "Certifications & assessment", ""],
    "CLOUD SKILL BADGES": ["GOOGLE CLOUD", "Cloud skill badges", "https://www.skills.google/public_profiles/fff275a1-614b-4042-b5af-76f9d5328154"],
    "LEARNING MODULES": ["MICROSOFT LEARN", "Learning modules", "https://learn.microsoft.com/en-us/users/yogaagustiansyah-1326/"],
    "COMPLETED COURSES": ["PROGRAMS & COURSES", "Completed courses", "https://drive.google.com/drive/folders/1gFloxduPbQOUbUah_89M731AWmMwgxEc?usp=sharing"],
  };
  return <DetailShell><PageLead crumb="CREDENTIALS" title={<>Credentials &<br /> learning.</>} intro="A record of certifications, skill badges, language assessment, and courses across software, AI, and data." /><div className="v2-credential-groups">{credentialGroups.map(group => { const [eyebrow, title, publicRecord] = groupMeta[group.label] ?? [group.label, group.label, ""]; return <section key={group.label}><div className="v2-credential-group-heading"><p className="v2-eyebrow">{eyebrow}</p><h2>{title}</h2>{publicRecord && <a href={publicRecord} target="_blank" rel="noreferrer">VIEW PUBLIC RECORD ↗</a>}</div><div className="v2-credential-items">{group.items.map(([recordTitle, issuer, href]) => <div className="v2-credential-row" key={recordTitle}><strong>{recordTitle}</strong><span>{issuer}</span>{href && <a href={href} target="_blank" rel="noreferrer">VIEW ↗</a>}</div>)}</div></section>; })}</div><div className="v2-detail-end"><Link href="/about">BACK TO ABOUT ↗</Link></div></DetailShell>;
}
