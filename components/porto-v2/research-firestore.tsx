import Link from "next/link";
import { DetailShell } from "./detail-pages";
import { ResearchFigure } from "./research-figure";
import { getPublishedResearch } from "@/lib/porto-v2/content";

export async function PublishedResearchPage() {
  const records = await getPublishedResearch();
  return <DetailShell><div className="v2-page-lead"><div className="v2-crumb"><Link href="/">HOME</Link><span>/</span><span>RESEARCH</span></div><h1>Questions worth testing.</h1><p>Research sits alongside the work, but follows a different pace: define a question, test it carefully, and make the limits visible.</p></div>
    {records.map(record => <section className="v2-research-intro" key={record.slug}><p className="v2-eyebrow">{record.category.toUpperCase()}</p><h2>{record.title}</h2><p>{record.summary}</p><Link href={`/research/${record.slug}`} className="v2-outline-link">EXPLORE THE RESEARCH ↗</Link><div className="v2-research-preview"><ResearchFigure /><span>RESEARCH INTERFACE PREVIEW</span></div><p className="v2-caption">ACADEMIC PROJECT / INTERFACE STUDY · SOURCE FOOTAGE OMITTED</p></section>)}
    <div className="v2-detail-end"><Link href="/">BACK TO HOME ↗</Link></div>
  </DetailShell>;
}

export async function PublishedResearchDetailPage({slug}: {slug: string}) {
  const record = (await getPublishedResearch()).find(item => item.slug === slug);
  if (!record) return null;
  return <DetailShell><Link className="v2-all-work" href="/research">← ALL RESEARCH</Link><section className="v2-research-intro"><p className="v2-eyebrow">{record.category.toUpperCase()}</p><h2>{record.title}</h2><p>{record.summary}</p><div className="v2-research-preview"><ResearchFigure /><span>RESEARCH INTERFACE PREVIEW</span></div><p className="v2-caption">ACADEMIC PROJECT / INTERFACE STUDY · SOURCE FOOTAGE OMITTED</p></section><section className="v2-research-rows">{record.rows.map(([heading, body]) => <div key={heading}><h3>{heading}</h3><p>{body}</p></div>)}</section><div className="v2-detail-end"><Link href="/research">BACK TO RESEARCH ↗</Link></div></DetailShell>;
}
