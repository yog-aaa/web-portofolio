import type { Metadata } from "next";
import { ThemeVariables } from "@/lib/porto-v2/theme-variables";

export const metadata: Metadata = {
  title: { default: "Owner · YOGAAA.", template: "%s · YOGAAA." },
  description: "Private owner access to YOGAAA.",
  robots: { index: false, follow: false, noarchive: true },
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = await ThemeVariables();
  return <>{theme}{children}</>;
}
