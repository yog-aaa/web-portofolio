"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Overview", "/admin"], ["Projects", "/admin/projects"], ["Experience", "/admin/experience"],
  ["Research", "/admin/research"], ["Thoughts", "/admin/thoughts"], ["Credentials", "/admin/credentials"],
  ["Media", "/admin/media"], ["Master data", "/admin/master-data"], ["Settings", "/admin/settings"],
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Owner workspace" className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
    {links.map(([label, href]) => {
      const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={`transition-interactive flex min-h-target shrink-0 items-center border-l-2 px-4 py-2 text-caption font-medium ${active
          ? "border-accent bg-accent-very-soft text-foreground" : "border-transparent text-foreground-secondary hover:border-border-control hover:text-foreground"}`}>
        {label}
      </Link>;
    })}
  </nav>;
}
