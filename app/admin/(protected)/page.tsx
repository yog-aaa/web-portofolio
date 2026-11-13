import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireOwnerPage } from "@/lib/auth/require-owner";

export default async function OwnerPage() {
  const owner = await requireOwnerPage();
  return <main className="cms-overview">
    <AdminPageHeader eyebrow="CONTENT STUDIO" title="Overview"
      description={`Welcome, ${owner.name}. Your Firebase owner session is active.`} />
    <div className="cms-overview-leads">
      <section className="cms-continue">
        <p>PORTO V2</p><h2>Review the public experience.</h2>
        <span>The responsive portfolio is ready to inspect across pages and themes.</span>
        <Link href="/" target="_blank" rel="noreferrer">OPEN WEBSITE ↗</Link>
      </section>
      <section className="cms-review">
        <p>CMS INTEGRATION</p><h2>Owner access is connected.</h2>
        <span>Content editing still uses the previous database until the Firestore migration is complete.</span>
        <Link href="/admin/homepage">REVIEW HOMEPAGE SLICE ↗</Link>
      </section>
    </div>
    <div className="cms-overview-links">
      <section><h2>Design slices</h2><p>Review the owner-only pages already prepared for the new data model.</p>
        <Link href="/admin/homepage">HOMEPAGE & PROFILE ↗</Link>
        <Link href="/admin/education">EDUCATION ↗</Link>
      </section>
      <section><h2>Current data layer</h2><p>Existing content editors still depend on PostgreSQL. Their Firestore replacement and publishing flow are the next implementation phase.</p>
        <Link href="/work" target="_blank" rel="noreferrer">VIEW PUBLIC WORK ↗</Link>
      </section>
    </div>
  </main>;
}
