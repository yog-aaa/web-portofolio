import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function EducationPage() {
  return <main className="cms-static-module"><AdminPageHeader eyebrow="IDENTITY / EDUCATION" title="Education" description="The formal education record that appears on the public About page." /><div className="cms-static-grid"><section><p className="v2-eyebrow">FORMAL EDUCATION</p><h2>Institut Teknologi Garut</h2><p>S1 Teknik Informatika · Sarjana Komputer / Bachelor of Computer Science</p><dl><div><dt>PERIOD</dt><dd>2022 — 2026</dd></div><div><dt>FOCUS</dt><dd>Software Engineering · Intelligent System</dd></div><div><dt>GPA</dt><dd>3.95</dd></div></dl></section><aside><p className="v2-eyebrow">PUBLIC PREVIEW</p><p>This record is currently part of the static Porto V2 slice. The content editor will be connected to Firebase CMS data in the integration phase.</p><Link href="/about#education" target="_blank" rel="noreferrer">VIEW ON PUBLIC SITE ↗</Link></aside></div></main>;
}
