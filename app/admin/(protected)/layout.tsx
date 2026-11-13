import Link from "next/link";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { ThemeToggle } from "@/components/porto-v2/interactions";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { SignOutButton } from "./sign-out-button";
import "@/components/porto-v2/landing.css";
import "@/components/admin/cms-v2.css";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return <div className="porto-v2 cms-v2"><AdminNavigation /><div className="cms-workspace"><header className="cms-topbar"><div><span className="cms-topbar-kicker">YOGAAA. / CONTENT STUDIO</span><strong>Portfolio workspace</strong></div><div className="cms-topbar-actions"><ThemeToggle /><Link href="/" target="_blank" rel="noreferrer">VIEW SITE ↗</Link><SignOutButton /></div></header><div className="cms-content">{children}</div></div></div>;
}
