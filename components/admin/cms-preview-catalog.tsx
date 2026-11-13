"use client";

import Link from "next/link";
import { useState } from "react";

export type PreviewItem = { title: string; meta: string; status?: string; href?: string };

export function CmsPreviewCatalog({ items, label }: { items: PreviewItem[]; label: string }) {
  const [query, setQuery] = useState("");
  const visible = items.filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <><label className="cms-preview-search">Search {label}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${label}`} /></label><div className="cms-preview-table">{visible.length ? visible.map(item => <div className="cms-preview-row" key={item.title}><div><strong>{item.title}</strong><span>{item.meta}</span></div>{item.status && <em>{item.status}</em>}{item.href ? <Link href={item.href}>Edit ↗</Link> : <span className="cms-preview-no-action">—</span>}</div>) : <p className="cms-preview-empty">No matching {label}.</p>}</div></>;
}
