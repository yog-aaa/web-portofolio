import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { getAdminContentService } from "@/lib/services/admin-content-server";
import { PasswordForm } from "./password-form";

export default async function OwnerPage() {
  const [owner, dashboard] = await Promise.all([requireOwnerPage(), getAdminContentService().dashboard()]);
  const stats = [
    [dashboard.projects.total, "Projects", "All project records"],
    [dashboard.thoughts.draft, "Thought drafts", "Private writing"],
    [dashboard.credentials.total, "Credentials", "Catalogued"],
    [dashboard.research.total, "Research", "Academic records"],
  ] as const;
  return <main className="cms-overview"><AdminPageHeader eyebrow="CONTENT STUDIO" title="Overview" description={`Welcome, ${owner.name}. A clear view of content, drafts, and what needs review.`} action={{ href: "/admin/projects?new=1", label: "+ New content" }} /><div className="cms-overview-leads"><section className="cms-continue"><p>CONTINUE WRITING</p><h2>{dashboard.thoughts.draft ? "Return to your drafts." : "Begin a new thought."}</h2><span>{dashboard.thoughts.draft ? "Keep developing your private writing before it reaches the public site." : "Start privately, shape the story, then review it before publication."}</span><Link href={dashboard.thoughts.draft ? "/admin/thoughts" : "/admin/thoughts?new=1"}>{dashboard.thoughts.draft ? "OPEN THOUGHTS ↗" : "NEW THOUGHT ↗"}</Link></section><section className="cms-review"><p>PUBLISHING QUEUE</p><h2>{dashboard.thoughts.draft} thought {dashboard.thoughts.draft === 1 ? "draft" : "drafts"} to review</h2><span>Private drafts stay off the public site until you publish them.</span><Link href="/admin/thoughts">REVIEW WRITING ↗</Link></section></div><section className="cms-overview-stats" aria-label="Content overview">{stats.map(([count, label, note]) => <div key={label}><strong>{String(count).padStart(2, "0")}</strong><span>{label}</span><small>{note}</small></div>)}</section><div className="cms-overview-links"><section><h2>Continue editing</h2><p>Return to a collection and keep the portfolio current.</p><Link href="/admin/projects">PROJECTS ↗</Link><Link href="/admin/experience">EXPERIENCE ↗</Link><Link href="/admin/credentials">CREDENTIALS ↗</Link></section><section><h2>Public site snapshot</h2><p>Preview the current public slice in its active theme.</p><div>YOGAAA.<strong>YOGA AGUSTIANSYAH.</strong></div><Link href="/" target="_blank" rel="noreferrer">OPEN PUBLIC SITE ↗</Link></section></div><details className="cms-account"><summary>ACCOUNT SECURITY</summary><div><h2>Change password</h2><p>Use at least 12 characters.</p><PasswordForm /></div></details></main>;
}
