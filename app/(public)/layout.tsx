import { connection } from "next/server";
import { PublicShell } from "@/components/site/public-shell";
import { getProfile, getSiteSettings, getThemeSettings } from "@/lib/queries/public-content";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  await connection();
  const [settings, theme, profile] = await Promise.all([getSiteSettings(), getThemeSettings(), getProfile()]);
  return <PublicShell settings={settings} theme={theme} profile={profile}>{children}</PublicShell>;
}
