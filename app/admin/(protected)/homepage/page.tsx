import Image from "next/image";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function HomepagePage() {
  return <main className="cms-static-module"><AdminPageHeader eyebrow="SITE / HOMEPAGE & PROFILE" title="Homepage & profile" description="The current story, featured work, and contact path in one place." action={{ href: "/admin/settings", label: "Open site settings" }} /><div className="cms-static-grid"><section><p className="v2-eyebrow">HERO / PUBLIC COPY</p><h2>YOGA AGUSTIANSYAH.</h2><p>Software developer & AI explorer</p><p>I build software, explore computer vision, and turn complex ideas into useful experiences.</p><div className="cms-static-featured"><p className="v2-eyebrow">FEATURED WORK</p>{["Sakode Academy", "AISnet Mobile", "ReyyAid Top Up"].map(item => <span key={item}>{item}</span>)}</div><p className="v2-eyebrow">EXPLORING</p><p>UI/UX design · AI agents & orchestration · System analysis · DevOps & server operations</p></section><aside><Image src="/porto-v2/yoga-portrait.png" alt="Portrait used in the public hero" width={300} height={400} /><p>The public landing page currently uses the approved static content and supplied visual assets. CMS binding follows the Firebase migration.</p><Link href="/" target="_blank" rel="noreferrer">VIEW LIVE SLICE ↗</Link></aside></div></main>;
}
