import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-ui";
import { ThemeSettingsForm } from "@/components/admin/theme-settings-form";
import { getAdminSettingsService } from "@/lib/services/admin-settings-server";

export default async function ThemeSettingsPage({ searchParams }: PageProps<"/admin/settings/theme">) {
  await connection();
  const [settings, query] = await Promise.all([getAdminSettingsService().theme(), searchParams]);
  const notice = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  return <main>
    <AdminPageHeader eyebrow="APPEARANCE" title="Theme" description="Adjust the approved semantic colors. Layout, typography, spacing, and accessibility behavior remain code-owned." />
    <AdminNotice notice={notice} />
    <div className="mt-10"><ThemeSettingsForm settings={settings} /></div>
  </main>;
}
