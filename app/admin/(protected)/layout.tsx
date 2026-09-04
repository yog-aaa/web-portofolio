import Link from "next/link";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { SignOutButton } from "./sign-out-button";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="container-site flex min-h-20 items-center justify-between gap-4">
          <Link href="/admin" className="text-h3 font-medium tracking-tight">YOGAAA. <span className="type-metadata ml-2 text-foreground-secondary">OWNER</span></Link>
          <div className="flex items-center gap-4"><Link href="/" target="_blank" rel="noreferrer" aria-label="View site (opens in a new tab)" className="type-metadata min-h-target items-center text-foreground-secondary underline underline-offset-4 sm:inline-flex">VIEW SITE ↗</Link><SignOutButton /></div>
        </div>
      </header>
      <div className="container-site py-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pr-8"><AdminNavigation /></aside>
        <div className="min-w-0 pt-8 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
