import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { getAdminContentService } from "@/lib/services/admin-content-server";
import { PasswordForm } from "./password-form";

export default async function OwnerPage() {
  const [owner, dashboard] = await Promise.all([
    requireOwnerPage(), getAdminContentService().dashboard(),
  ]);
  const sections = [
    { href: "/admin/projects", label: "Projects", stats: dashboard.projects, note: `${dashboard.projects.published} published · ${dashboard.projects.draft} draft` },
    { href: "/admin/research", label: "Research", stats: dashboard.research, note: `${dashboard.research.published} published · ${dashboard.research.draft} draft` },
    { href: "/admin/thoughts", label: "Thoughts", stats: dashboard.thoughts, note: `${dashboard.thoughts.published} published · ${dashboard.thoughts.draft} draft` },
    { href: "/admin/experience", label: "Experience", stats: dashboard.experience, note: `${dashboard.experience.visible} visible` },
    { href: "/admin/credentials", label: "Credentials", stats: dashboard.credentials, note: `${dashboard.credentials.visible} visible` },
  ];
  return (
    <main className="pb-section">
      <AdminPageHeader eyebrow="PRIVATE WORKSPACE" title={`Welcome, ${owner.name}.`} description="Keep the public website current without editing source code. Draft privately, review carefully, then publish." />
      <section aria-labelledby="content-overview" className="mt-10"><h2 id="content-overview" className="type-metadata mb-4 text-foreground-secondary">CONTENT OVERVIEW</h2>
        <div className="grid border-b border-border sm:grid-cols-2 xl:grid-cols-3">{sections.map((section) => <Link key={section.href} href={section.href} className="group border-t border-border px-1 py-6 sm:odd:pr-6 sm:even:border-l sm:even:pl-6 xl:border-l xl:first:border-l-0 xl:nth-[4]:border-l-0">
          <p className="type-metadata text-foreground-secondary">{section.stats.total} TOTAL</p><h3 className="mt-3 text-h3 group-hover:underline group-hover:underline-offset-4">{section.label}</h3><p className="mt-2 text-caption text-foreground-secondary">{section.note}</p>
        </Link>)}</div>
      </section>
      <section aria-labelledby="password-heading" className="mt-14 max-w-form border-t border-border pt-8">
        <h2 id="password-heading" className="text-h3">Change password</h2>
        <p className="mt-2 mb-6 text-caption text-foreground-secondary">Replace your temporary password after your first sign in. Use at least 12 characters.</p>
        <PasswordForm />
      </section>
    </main>
  );
}
