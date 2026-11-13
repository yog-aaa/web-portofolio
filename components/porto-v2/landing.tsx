import Image from "next/image";
import Link from "next/link";
import { LandingInteractions, LandingIntro, ThemeToggle } from "./interactions";

const linkedin = "https://www.linkedin.com/in/yoga-agustiansyah/";

function Arrow({ direction = "up" }: { direction?: "up" | "down" }) {
  return <span aria-hidden="true">{direction === "up" ? "↗" : "↓"}</span>;
}

function Brand() {
  return <a className="v2-brand" href="#top" aria-label="YOGAAA. — back to top">
    <Image src="/porto-v2/yogaaa-mark.png" alt="" width={24} height={24} />
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

function Hero() {
  return <section className="v2-hero" aria-labelledby="hero-heading">
    <div className="v2-hero-stage">
      <div className="v2-hero-watermark" aria-hidden="true">YOGAAA.</div>
      <div className="v2-hero-glow" aria-hidden="true" />
      <div className="v2-hero-copy">
        <p className="v2-eyebrow">PORTFOLIO&nbsp; / &nbsp;2026</p>
        <h1 id="hero-heading">YOGA<span>AGUSTIANSYAH.</span></h1>
        <p className="v2-hero-role">SOFTWARE DEVELOPER &amp;<br />AI EXPLORER</p>
        <p className="v2-hero-description">I build software, explore computer vision,<br className="v2-desktop-break" /> and turn complex ideas into useful experiences.</p>
        <a className="v2-button v2-button-primary v2-hero-cta" href="#selected-work">EXPLORE MY WORK <Arrow /></a>
      </div>
      <div className="v2-portrait-wrap">
        <Image className="v2-portrait" src="/porto-v2/yoga-portrait.png" alt="Portrait of Yoga Agustiansyah" width={1086} height={1450} priority sizes="(max-width: 600px) 85vw, (max-width: 900px) 55vw, 42vw" />
      </div>
      <aside className="v2-hero-aside" aria-label="Portfolio at a glance">
        <p className="v2-aside-label">IN NUMBERS</p>
        <div className="v2-stat"><strong>06</strong><span>PROJECTS<br />COMPLETED</span></div>
        <div className="v2-stat"><strong>07</strong><span>TEAMS + CLIENTS<br />WORKED WITH</span></div>
        <a className="v2-collab" href={linkedin} target="_blank" rel="noreferrer">LET&apos;S COLLABORATE <Arrow /></a>
        <a className="v2-scroll-cue" href="#selected-work"><Arrow direction="down" /> SCROLL TO EXPLORE</a>
      </aside>
    </div>
    <div className="v2-hero-bottom"><span><b aria-hidden="true">◉</b> SELECTED WORK</span><span>SCROLL TO DISCOVER</span><span>HOME / 01</span></div>
  </section>;
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow?: string; title: string; description: string; id: string }) {
  return <div className="v2-section-head">{eyebrow && <p className="v2-eyebrow">{eyebrow}</p>}<h2 id={id}>{title}</h2><p>{description}</p></div>;
}

function Work() {
  return <section id="selected-work" className="v2-section v2-work" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="What I've built." description="A selection of products I've built with teams across education, campus life, and commerce." />
    <article className="v2-featured">
      <div className="v2-featured-copy"><p className="v2-eyebrow">FEATURED PROJECT</p><h3>Sakode<br />Academy</h3><p>I continued frontend development of Sakode Academy&apos;s public site, presenting its classes, projects, and team.</p><div className="v2-tags"><span>FRONTEND DEVELOPMENT</span><span>COMPANY PROFILE</span></div><a href="https://sakode.com" target="_blank" rel="noreferrer">VISIT SAKODE.COM <Arrow /></a></div>
      <div className="v2-featured-art"><span aria-hidden="true">SAKODE</span><Image src="/porto-v2/sakode-home.png" alt="Sakode Academy landing page" width={1792} height={850} sizes="(max-width: 700px) 75vw, 45vw" /></div>
    </article>
    <div className="v2-work-subhead">MORE PROJECTS <span>/ 02</span></div>
    <div className="v2-project-grid">
      <article className="v2-project"><Image src="/porto-v2/aisnet-artwork.png" alt="AISnet Mobile app store artwork showing the academic services interface" width={1024} height={500} sizes="(max-width: 700px) 40vw, 35vw" /><div><p className="v2-project-index">01</p><div className="v2-project-identity"><Image src="/porto-v2/aisnet-icon.png" alt="" width={38} height={38} /><h3>AISnet Mobile</h3></div><p>I designed and built the Flutter app for ITG students using its existing API.</p><div className="v2-project-bottom"><span>UI DESIGN / FLUTTER</span><Link href="/work/aisnet-mobile">VIEW PROJECT <Arrow /></Link></div></div></article>
      <article className="v2-project"><Image src="/porto-v2/reyy-home.png" alt="ReyyAid Top Up game storefront homepage" width={1796} height={880} sizes="(max-width: 700px) 40vw, 35vw" /><div><p className="v2-project-index">02</p><div className="v2-project-identity"><Image src="/porto-v2/reyy-icon.png" alt="" width={38} height={38} /><h3>ReyyAid Top Up</h3></div><p>I built the game top-up website frontend with Puru Software Agency.</p><div className="v2-project-bottom"><span>FRONTEND / PURU</span><Link href="/work/reyyaid-top-up">VIEW PROJECT <Arrow /></Link></div></div></article>
    </div>
    <Link className="v2-outline-link" href="/work">VIEW ALL PROJECTS <Arrow /></Link>
  </section>;
}

function Experience() {
  return <section id="experience" className="v2-section v2-experience" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" eyebrow="EXPERIENCE & COLLABORATION" title="The teams behind the work." description="Engineering at ITG, leading client work at Puru, and building a coding academy with Sakode." />
    <div className="v2-experience-grid">
      <article className="v2-experience-lead"><div className="v2-org-mark"><Image src="/porto-v2/itg-logo.png" alt="" width={72} height={72} /><span aria-hidden="true">ITG</span></div><p className="v2-eyebrow">FULL-TIME ROLE</p><h3>Institut Teknologi<br />Garut</h3><p className="v2-experience-role">JUNIOR SOFTWARE ENGINEER · FULLSTACK</p><p className="v2-experience-date">APR 2026 — PRESENT</p><p>Building web and mobile systems with the digitalization and information systems team. I focus on frontend and mobile development while collaborating on new features and maintenance.</p><a href="https://itg.ac.id" target="_blank" rel="noreferrer">ITG.AC.ID <Arrow /></a></article>
      <div className="v2-experience-list"><article><div className="v2-org-mini"><Image src="/porto-v2/puru-logo.svg" alt="" width={72} height={72} /><div><h3>Puru Software Agency</h3><p>FOUNDER & CTO · PROJECT MANAGER</p></div><time>JUL 2026 — PRESENT</time></div><p>Leading project delivery and frontend development alongside UI/UX designers, analysts, and client teams.</p><a href="https://www.linkedin.com/company/puru-software-agency/" target="_blank" rel="noreferrer">PURU ON LINKEDIN <Arrow /></a></article><article><div className="v2-org-mini"><Image src="/porto-v2/sakode-logo.png" alt="" width={72} height={24} /><div><h3>Sakode Academy</h3><p>FOUNDER · OPERATIONS LEAD</p></div><time>MAY 2026 — PRESENT</time></div><p>Coordinating marketing, technology, and learning-path teams to build a coding academy for young learners.</p><a href="https://sakode.com" target="_blank" rel="noreferrer">SAKODE.COM <Arrow /></a></article></div>
    </div>
    <div className="v2-experience-foot"><p>Earlier roles, community work, and teaching continue in the full timeline.</p><Link className="v2-outline-link" href="/experience">VIEW ALL EXPERIENCE <Arrow /></Link></div>
  </section>;
}

const learning = [
  { label: "UI/UX DESIGN", title: "Designing for people.", body: "I often build interfaces without a finished design. I'm studying usability, information hierarchy, and interaction design so the features I deliver feel clear and comfortable to use." },
  { label: "AI AGENTS & ORCHESTRATION", title: "Directing AI systems.", body: "I'm moving beyond chat-based coding help to learn agent design, orchestration, controls, and MCP—and how to make AI assistance useful in real workflows." },
  { label: "SYSTEM ANALYSIS", title: "Seeing the whole system.", body: "I'm learning to map requirements, system flows, and security risks before implementation, then guide and review the work AI helps produce." },
];

function Learning() {
  return <section className="v2-learning" aria-labelledby="learning-heading"><div className="v2-section">
    <SectionHeading id="learning-heading" title="What I'm learning now." description="Frontend is my home base. I'm widening how I think about the people, systems, and tools behind each product." />
    <div className="v2-learning-list">{learning.map((item, index) => <article key={item.label} className="v2-learning-row"><span className="v2-learning-index">0{index + 1}</span><div><p className="v2-eyebrow">{item.label}</p><h3>{item.title}</h3></div><p>{item.body}</p></article>)}</div>
    <div className="v2-next-up"><div><p className="v2-eyebrow">NEXT UP</p><h3>DevOps &amp; server operations.</h3></div><p>I plan to learn deployment, server management, and maintenance so I understand what happens after a product ships.</p></div>
  </div></section>;
}

function Closing() {
  return <><section className="v2-closing v2-section" aria-labelledby="closing-heading"><div className="v2-closing-panel"><div className="v2-closing-main"><p className="v2-eyebrow">LET&apos;S COLLABORATE</p><h2 id="closing-heading">Let&apos;s make<br />something useful.</h2><p>For product work, frontend delivery, or a thoughtful collaboration—tell me what you&apos;re building.</p><a className="v2-button v2-button-primary" href={linkedin} target="_blank" rel="noreferrer">START A CONVERSATION <Arrow /></a></div><div className="v2-closing-links"><p className="v2-eyebrow">EXPLORE FURTHER</p><Link href="/about"><strong>About</strong><span>The person behind the work.</span><Arrow /></Link><Link href="/research"><strong>Research</strong><span>Investigations and experiments.</span><Arrow /></Link><Link href="/thoughts"><strong>Thoughts</strong><span>Notes from building and learning.</span><Arrow /></Link></div></div></section><footer className="v2-footer"><Brand /><a href="mailto:yogaaa.koneksi@gmail.com">yogaaa.koneksi@gmail.com <Arrow /></a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a><a href="https://www.instagram.com/yoga0_120/" target="_blank" rel="noreferrer">Instagram · @yoga0_120 <Arrow /></a><a href="#top">BACK TO TOP ↑</a></footer></>;
}

export function PortoLanding() {
  return <div className="porto-v2" id="top"><LandingIntro /><div className="v2-page"><span className="v2-skip"><a href="#main-content">Skip to content</a></span><Header /><main id="main-content"><Hero /><Work /><Experience /><Learning /><Closing /></main></div></div>;
}
