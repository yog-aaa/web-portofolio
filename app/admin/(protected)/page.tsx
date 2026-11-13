import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { getCmsCollection } from "@/lib/porto-v2/cms-firestore";

export default async function OwnerPage() {
  const owner = await requireOwnerPage();
  const [projects, experiences, credentials, media] = await Promise.all([
    getCmsCollection("projects"), getCmsCollection("experiences"),
    getCmsCollection("credentials"), getCmsCollection("mediaAssets"),
  ]);
  return <main className="cms-overview">
    <AdminPageHeader eyebrow="CONTENT STUDIO / FIRESTORE" title="Overview"
      description={`Welcome, ${owner.name}. Your portfolio content is connected to Firestore and Cloudinary.`} />
    <div className="cms-overview-leads"><section className="cms-continue"><p>PORTO V2</p><h2>Keep the work current.</h2><span>{projects.length} projects · {experiences.length} experiences · {credentials.length} credentials · {media.length} media assets.</span><Link href="/admin/projects">EDIT PROJECTS ↗</Link></section>
      <section className="cms-review"><p>LIVE WEBSITE</p><h2>Review the public experience.</h2><span>Published content appears in the responsive portfolio. Draft thoughts remain private.</span><Link href="/" target="_blank" rel="noreferrer">OPEN WEBSITE ↗</Link></section></div>
    <div className="cms-overview-links"><section><h2>Content</h2><p>Edit the records behind the portfolio.</p><Link href="/admin/experience">EXPERIENCE ↗</Link><Link href="/admin/credentials">CREDENTIALS ↗</Link><Link href="/admin/thoughts">THOUGHTS ↗</Link></section>
      <section><h2>Identity & media</h2><p>Manage site copy and approved Cloudinary images.</p><Link href="/admin/homepage">HOMEPAGE & PROFILE ↗</Link><Link href="/admin/media">MEDIA LIBRARY ↗</Link></section></div>
  </main>;
}
