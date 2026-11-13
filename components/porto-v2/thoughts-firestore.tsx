import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DetailShell } from "./detail-pages";
import { getPublishedThoughts } from "@/lib/porto-v2/content";

export async function PublishedThoughtsPage() {
  const thoughts = await getPublishedThoughts();
  return <DetailShell><div className="v2-page-lead"><div className="v2-crumb"><Link href="/">HOME</Link><span>/</span><span>THOUGHTS</span></div><h1>Thinking in public,<br />when there is something to say.</h1><p>A working notebook on interfaces, AI-assisted development, and the systems shaped before code is written.</p></div>
    {thoughts.length ? thoughts.map(item => <Link className="v2-thought-card" href={`/thoughts/${item.slug}`} key={item.slug}>
      {item.coverUrl && <Image src={item.coverUrl} alt="" width={1792} height={850} sizes="(max-width: 700px) 90vw, 85vw" />}
      <span className="v2-eyebrow">THOUGHT</span><h2>{item.title}</h2><p>{item.summary}</p><span>READ THE THOUGHT ↗</span>
    </Link>) : <div className="v2-thought-empty"><h2>Writing is in progress.</h2><p>The first thought will appear here when it has been reviewed and published.</p></div>}
    <div className="v2-detail-end"><Link href="/">BACK TO HOME ↗</Link></div>
  </DetailShell>;
}

export async function PublishedThoughtPage({slug}: {slug: string}) {
  const thought = (await getPublishedThoughts()).find(item => item.slug === slug);
  if (!thought) return null;
  return <DetailShell><Link className="v2-all-work" href="/thoughts">← ALL THOUGHTS</Link><article className="v2-article">
    <div className="v2-article-lead"><p className="v2-eyebrow">THOUGHT</p><h1>{thought.title}</h1><p>{thought.summary}</p></div>
    {thought.coverUrl && <figure><Image src={thought.coverUrl} alt="" width={1792} height={850} sizes="(max-width: 700px) 90vw, 85vw" /></figure>}
    <div className="v2-article-body"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{img: ({src, alt}) => typeof src === "string" ? <Image src={src} alt={alt ?? ""} width={1200} height={700} sizes="(max-width: 700px) 90vw, 70vw" /> : null}}>{thought.bodyMarkdown ?? ""}</ReactMarkdown></div>
  </article><div className="v2-detail-end"><Link href="/thoughts">BACK TO ALL THOUGHTS ↗</Link></div></DetailShell>;
}
