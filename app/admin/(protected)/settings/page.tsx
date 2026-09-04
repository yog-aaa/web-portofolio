import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-ui";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getAdminSettingsService } from "@/lib/services/admin-settings-server";
import { getAdminContentService } from "@/lib/services/admin-content-server";

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await connection();
  const [settings, media, query] = await Promise.all([
    getAdminSettingsService().site(), getAdminContentService().mediaOptions("profile"), searchParams,
  ]);
  const notice = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  return <main>
    <AdminPageHeader eyebrow="SITE" title="Settings" description="Manage public identity, portrait, homepage copy, contact details, and social links."
      action={{ href: "/admin/settings/theme", label: "Edit theme" }} />
    <AdminNotice notice={notice} />
    <div className="mt-10 max-w-content"><SiteSettingsForm settings={settings} media={media} /></div>
  </main>;
}
