"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const groups = [
  { label: "WORKSPACE", items: [
    ["Overview", "/admin", "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z"],
    ["Projects", "/admin/projects", "M3 7h18v13H3z M3 7l4-3h10l4 3 M8 12h8"],
    ["Experience", "/admin/experience", "M4 7h16v13H4z M9 7V4h6v3 M4 12h16"],
    ["Education", "/admin/education", "M3 8l9-5 9 5-9 5z M6 11v6c3 2 9 2 12 0v-6 M21 8v7"],
    ["Research", "/admin/research", "M9 3h6 M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3 M8 16h8"],
    ["Thoughts", "/admin/thoughts", "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5"],
  ] },
  { label: "LIBRARY", items: [
    ["Credentials", "/admin/credentials", "M6 3h12v13H6z M9 20l3-3 3 3 M9 8h6 M9 12h6"],
    ["Media", "/admin/media", "M3 4h18v16H3z M7 14l3-3 3 3 2-2 3 4 M8 8h.01"],
    ["Master data", "/admin/master-data", "M4 5h16 M4 12h16 M4 19h16 M8 3v4 M16 10v4 M11 17v4"],
  ] },
  { label: "SITE", items: [
    ["Homepage & profile", "/admin/homepage", "M3 4h18v16H3z M7 9h7 M7 13h10 M7 17h6"],
    ["Settings", "/admin/settings", "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M18.4 5.6l-2.1 2.1 M7.7 16.3l-2.1 2.1 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  ] },
] as const;

function Icon({ path }: { path: string }) { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>; }

function NavLinks({ expanded, close, previewScreen }: { expanded: boolean; close?: () => void; previewScreen?: string }) {
  const pathname = usePathname();
  return <>{groups.map(group => <div className="cms-nav-group" key={group.label}><p className="cms-nav-label">{expanded ? group.label : group.label.slice(0, 1)}</p>{group.items.map(([label, href, icon]) => {
    const screen = href === "/admin" ? "overview" : href.split("/").at(-1)!;
    const active = previewScreen ? previewScreen === screen : href === "/admin" ? pathname === href : pathname.startsWith(href);
    const target = previewScreen ? `/preview/cms/${screen}` : href;
    return <Link key={href} href={target} title={expanded ? undefined : label} aria-label={label} aria-current={active ? "page" : undefined} className={`cms-nav-item${active ? " is-active" : ""}`} onClick={close}><Icon path={icon} /><span>{label}</span></Link>;
  })}</div>)}</>;
}

export function AdminNavigation({ previewScreen }: { previewScreen?: string } = {}) {
  const [expanded, setExpanded] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  useEffect(() => { if (!drawer) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [drawer]);
  const toggle = () => setExpanded(value => !value);
  const preview = previewScreen !== undefined;
  return <><aside className="cms-rail" data-expanded={expanded}><div className="cms-rail-brand"><Link href={preview ? "/preview/cms/overview" : "/admin"} aria-label="YOGAAA. CMS">Y.</Link><button type="button" onClick={toggle} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={expanded} title={expanded ? "Collapse sidebar" : "Expand sidebar"}>{expanded ? "←" : "→"}</button></div><nav aria-label="Owner workspace"><NavLinks expanded={expanded} previewScreen={previewScreen} /></nav><div className="cms-rail-bottom"><Link href="/" target="_blank" rel="noreferrer" title="View public site" aria-label="View public site">↗<span>View site</span></Link></div></aside><button className="cms-mobile-menu-button" type="button" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="cms-mobile-drawer">☰ <span>MENU</span></button><div className="cms-drawer" id="cms-mobile-drawer" hidden={!drawer} role="dialog" aria-modal="true" aria-label="CMS navigation"><div className="cms-drawer-top"><strong>YOGAAA. / CONTENT</strong><button type="button" onClick={() => setDrawer(false)} aria-label="Close menu">CLOSE ×</button></div><nav aria-label="Owner workspace mobile"><NavLinks expanded close={() => setDrawer(false)} previewScreen={previewScreen} /></nav></div><nav className="cms-bottom-nav" aria-label="Quick navigation"><Link href={preview ? "/preview/cms/overview" : "/admin"} aria-current={(preview ? previewScreen === "overview" : pathname === "/admin") ? "page" : undefined}>Overview</Link><Link href={preview ? "/preview/cms/projects" : "/admin/projects"} aria-current={(preview ? previewScreen === "projects" : pathname.startsWith("/admin/projects")) ? "page" : undefined}>Projects</Link><Link href={preview ? "/preview/cms/thoughts" : "/admin/thoughts"} aria-current={(preview ? previewScreen === "thoughts" : pathname.startsWith("/admin/thoughts")) ? "page" : undefined}>Write</Link></nav></>;
}
