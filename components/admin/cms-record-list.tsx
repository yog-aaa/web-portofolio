"use client";

import Link from "next/link";
import { useState } from "react";

type Item = {id: string; title: string; subtitle: string; status?: string};

export function CmsRecordList({items, selectedId, basePath, noun}: {items: Item[]; selectedId: string; basePath: string; noun: string}) {
  const [query, setQuery] = useState("");
  const visible = items.filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase().trim()));
  const editHref = (id: string) => `${basePath}${basePath.includes("?") ? "&" : "?"}edit=${encodeURIComponent(id)}`;
  return <aside className="cms-record-list" aria-label={`${noun} list`}>
    <div className="cms-record-list-top"><div><strong>{noun}</strong><span>{items.length} total</span></div><Link href={editHref("new")}>+ Add new</Link></div>
    {items.length > 7 && <div className="cms-record-search"><label htmlFor="cms-list-search">Search {noun.toLowerCase()}</label><input id="cms-list-search" type="search" placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} /></div>}
    <div className="cms-record-links">{visible.map(item => <Link key={item.id} aria-current={item.id === selectedId ? "page" : undefined} href={editHref(item.id)}><strong>{item.title}</strong><span>{item.subtitle}</span>{item.status && <small data-status={item.status}>{item.status === "published" ? "Published" : "Draft"}</small>}</Link>)}</div>
    {visible.length === 0 && <p className="cms-record-empty">{items.length === 0 ? `No ${noun.toLowerCase()} yet. Add the first one.` : "No matches. Try a shorter search."}</p>}
  </aside>;
}
