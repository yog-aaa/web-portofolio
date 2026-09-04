"use client";

import { useId, useRef, useState } from "react";
import type { AdminSocialLink } from "@/lib/domain/settings";
import { inferSocialIconKey, socialIconOptions, type SocialIconKey } from "@/lib/domain/social-icons";
import { SocialIcon } from "@/components/ui/social-icon";
import { fieldClass, helpClass, labelClass } from "./admin-ui";

type Row = { id: string; label: string; destination: string; platformKey: SocialIconKey };

export function SocialLinksEditor({ initialLinks }: { initialLinks: AdminSocialLink[] }) {
  const optionsId = useId();
  const nextId = useRef(initialLinks.length);
  const [rows, setRows] = useState<Row[]>(initialLinks.map((item, index) => ({
    id: item.id || `saved-${index}`,
    label: item.label,
    destination: item.destination,
    platformKey: item.platformKey ?? inferSocialIconKey(item.label, item.destination),
  })));

  function update(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function add() {
    const id = `new-${nextId.current++}`;
    setRows((current) => [...current, { id, label: "", destination: "", platformKey: "link" }]);
  }

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className={labelClass}>Social links</p><p className={helpClass}>Add HTTPS profiles and choose a code-owned icon. Type in the icon field to search.</p></div>
      <button type="button" onClick={add} className="transition-interactive min-h-target rounded-control border border-border-control bg-surface px-4 py-2 text-caption font-medium hover:border-accent">
        Add another social media
      </button>
    </div>
    {rows.length ? <div className="mt-5 space-y-4">{rows.map((row, index) => <fieldset key={row.id} className="grid gap-4 border-l border-border pl-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.35fr)_minmax(10rem,0.7fr)_auto] md:items-end">
      <legend className="sr-only">Social link {index + 1}</legend>
      <div><label htmlFor={`${row.id}-label`} className={labelClass}>Label</label><input id={`${row.id}-label`} name="socialLabel" value={row.label} required onChange={(event) => update(row.id, { label: event.target.value })} className={fieldClass} placeholder="GitHub" /></div>
      <div><label htmlFor={`${row.id}-url`} className={labelClass}>Profile URL</label><input id={`${row.id}-url`} name="socialDestination" value={row.destination} required type="url" pattern="https://.*" onChange={(event) => update(row.id, { destination: event.target.value })} className={fieldClass} placeholder="https://…" /></div>
      <div><label htmlFor={`${row.id}-icon`} className={labelClass}>Icon</label><div className="relative"><SocialIcon icon={row.platformKey} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary"/><input id={`${row.id}-icon`} name="socialIcon" list={optionsId} value={row.platformKey} required onChange={(event) => update(row.id, { platformKey: event.target.value as SocialIconKey })} className={`${fieldClass} pl-10`} /></div></div>
      <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} aria-label={`Remove ${row.label || `social link ${index + 1}`}`} className="transition-interactive min-h-target rounded-control border border-border-control px-3 text-caption hover:border-red-700 hover:text-red-800">Remove</button>
    </fieldset>)}</div> : <p className="mt-5 border-y border-border py-6 text-caption text-foreground-secondary">No social profiles added. Contact email remains managed separately.</p>}
    <datalist id={optionsId}>{socialIconOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</datalist>
  </div>;
}
