"use client";

import Link from "next/link";
import { useState } from "react";

export type PreviewItem = { title: string; meta: string; status?: string; href?: string };

export function CmsPreviewCatalog({ items, label, filters = false }: { items: PreviewItem[]; label: string; filters?: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const statuses = ["All", ...new Set(items.map(item => item.status).filter((value): value is string => Boolean(value)))];
  const visible = items.filter(item => (status === "All" || item.status === status) && `${item.title} ${item.meta}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <><div className="cms-preview-catalog-tools"><label className="cms-preview-search">Search {label}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${label}`} /></label>{filters && <div className="cms-preview-filters" aria-label={`Filter ${label} by status`}>{statuses.map(value => <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)}>{value} <span>{value === "All" ? items.length : items.filter(item => item.status === value).length}</span></button>)}</div>}</div><div className="cms-preview-table">{visible.length ? visible.map(item => <div className="cms-preview-row" key={item.title}><div><strong>{item.title}</strong><span>{item.meta}</span></div>{item.status && <em>{item.status}</em>}{item.href ? <Link href={item.href}>Edit ↗</Link> : <span className="cms-preview-no-action">—</span>}</div>) : <p className="cms-preview-empty">No matching {label}.</p>}</div></>;
}
