import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Owner · YOGAAA.", template: "%s · YOGAAA." },
  description: "Private owner access to YOGAAA.",
  robots: { index: false, follow: false, noarchive: true },
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
