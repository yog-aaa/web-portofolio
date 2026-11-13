"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCmsDocument } from "@/app/admin/(protected)/cms-actions";

type RecordValue = Record<string, unknown>;
type Media = {url: string; alt: string; name: string; format?: string};
type Field = {key: string; label: string; type?: "text" | "textarea" | "url" | "email" | "number" | "image" | "color" | "markdown" | "checkbox" | "select"; required?: boolean; hint?: string; options?: string[]; span?: boolean};
type Group = {title: string; note?: string; fields?: Field[]; repeat?: {key: string; label: string; columns: Field[]; shape: "pair" | "object" | "string"; blank: unknown; max?: number}};

const text = (key: string, label: string, required = true): Field => ({key, label, required});
const long = (key: string, label: string, required = true): Field => ({key, label, type: "textarea", required, span: true});
const link = (key: string, label: string, required = false): Field => ({key, label, type: "url", required});
const image = (key: string, label: string, required = true): Field => ({key, label, type: "image", required, span: true});
const number = (key: string, label: string, required = true): Field => ({key, label, type: "number", required});

function groupsFor(collection: string, id: string): Group[] {
  if (collection === "projects") return [
    {title: "Project identity", note: "These details appear on the work index and case study.", fields: [text("title", "Project name"), text("slug", "Page address"), text("category", "Category"), long("subtitle", "Short introduction"), text("role", "Your contribution"), text("team", "Team or organization"), text("surface", "Product type"), link("external", "Project website"), {key: "projectPhase", label: "Project status", type: "select", options: ["completed", "in-progress"]}, number("order", "Display order"), {key: "isFeatured", label: "Feature on homepage", type: "checkbox"}, number("featuredOrder", "Homepage order")]},
    {title: "Cover artwork", fields: [image("visual", "Project image"), text("alt", "Image description"), text("caption", "Image credit or caption")]},
    {title: "Case study", note: "Add a heading and paragraph for each part of the story.", repeat: {key: "sections", label: "Section", shape: "pair", columns: [text("heading", "Heading"), long("body", "Paragraph")], blank: ["", ""], max: 20}},
  ];
  if (collection === "experiences") return [
    {title: "Role", fields: [text("name", "Organization"), text("role", "Position and focus"), text("date", "Period"), number("order", "Display order"), {key: "status", label: "Visibility", type: "select", options: ["published", "draft"]}]},
    {title: "Story and brand", fields: [long("text", "What you did"), image("image", "Organization logo")]},
    {title: "Links", repeat: {key: "links", label: "Link", shape: "pair", columns: [text("label", "Label"), link("url", "Destination", true)], blank: ["", ""], max: 10}},
  ];
  if (collection === "credentials") return [{title: "Credential", fields: [text("title", "Credential title"), text("issuer", "Issuer"), text("group", "Group"), link("href", "Verification link"), number("order", "Display order"), {key: "status", label: "Visibility", type: "select", options: ["published", "draft"]}]}];
  if (collection === "education") return [
    {title: "Education", fields: [text("institution", "Institution"), text("program", "Program"), text("degree", "Degree"), number("startYear", "Start year"), number("endYear", "Graduation year"), text("gpa", "GPA"), number("order", "Display order"), {key: "status", label: "Visibility", type: "select", options: ["published", "draft"]}]},
    {title: "Focus areas", repeat: {key: "focus", label: "Focus area", shape: "string", columns: [text("value", "Area")], blank: "", max: 10}},
  ];
  if (collection === "thoughts") return [
    {title: "Article details", fields: [text("title", "Title"), text("slug", "Page address"), long("summary", "Short description"), image("coverUrl", "Cover image", false)]},
    {title: "Writing", note: "Write in Markdown. Use the image control below to place a library image between paragraphs.", fields: [{key: "bodyMarkdown", label: "Article body", type: "markdown", required: true, span: true}]},
  ];
  if (collection === "research") return [
    {title: "Research summary", fields: [text("title", "Title"), text("slug", "Page address"), text("category", "Category"), long("summary", "Overview")]},
    {title: "Story sections", repeat: {key: "rows", label: "Section", shape: "pair", columns: [text("heading", "Heading"), long("body", "Text")], blank: ["", ""], max: 30}},
  ];
  if (collection === "site" && id === "theme") return [
    {title: "Light mode", note: "Used by the public website and CMS when light mode is selected.", fields: [{key: "light.background", label: "Background", type: "color"}, {key: "light.foreground", label: "Text", type: "color"}, {key: "light.accent", label: "Accent", type: "color"}]},
    {title: "Dark mode", note: "Used by the public website and CMS when dark mode is selected.", fields: [{key: "dark.background", label: "Background", type: "color"}, {key: "dark.foreground", label: "Text", type: "color"}, {key: "dark.accent", label: "Accent", type: "color"}]},
  ];
  if (collection === "site") return [
    {title: "Identity", fields: [text("name", "Name"), text("role", "Role"), long("headline", "Hero introduction"), image("portraitUrl", "Portrait"), image("brandMarkUrl", "Brand mark")]},
    {title: "Contact", fields: [{key: "email", label: "Email", type: "email", required: true}, link("linkedin", "LinkedIn", true), link("instagram", "Instagram", true)]},
    {title: "Hero figures", note: "Update these numbers as your work grows.", fields: [number("completedProjectsCount", "Completed projects"), number("teamsAndClientsCount", "Teams and clients")]},
  ];
  if (collection === "pages" && id === "homepage") return [
    {title: "Section headings", fields: [text("headline", "Hero display name"), text("workHeading", "Work heading"), text("experienceHeading", "Experience heading"), text("learningHeading", "Learning heading")]},
    {title: "Current interests", repeat: {key: "learning", label: "Interest", shape: "object", columns: [text("label", "Category"), text("title", "Title"), long("body", "Description")], blank: {label: "", title: "", body: ""}, max: 12}},
    {title: "What comes next", fields: [text("nextUp.title", "Title"), long("nextUp.body", "Description")]},
  ];
  if (collection === "socialLinks") return [{title: "Social link", fields: [text("label", "Label"), link("href", "URL", true), number("order", "Display order")]}];
  if (collection === "projectCategories" || collection === "technologies") return [{title: "Taxonomy", fields: [text("name", "Name"), text("slug", "Slug"), number("order", "Display order")]}];
  return [{title: "Page", fields: [text("title", "Title")]}];
}

function getValue(data: RecordValue, path: string): unknown {
  return path.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as RecordValue)[part] : undefined, data);
}
function setValue(data: RecordValue, path: string, value: unknown): RecordValue {
  const copy = structuredClone(data);
  const parts = path.split(".");
  let at = copy;
  for (const part of parts.slice(0, -1)) {
    if (!at[part] || typeof at[part] !== "object") at[part] = {};
    at = at[part] as RecordValue;
  }
  at[parts.at(-1)!] = value;
  return copy;
}
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 95);
const labelFor = (collection: string) => ({projects: "project", experiences: "experience", credentials: "credential", education: "education", thoughts: "thought", research: "research"}[collection] ?? "record");
function defaultsFor(collection: string): RecordValue {
  if (collection === "projects") return {sections: [], order: 0, projectPhase: "completed", isFeatured: false, featuredOrder: 0};
  if (collection === "experiences") return {links: [], order: 0, status: "published"};
  if (collection === "credentials") return {href: "", order: 0, status: "published"};
  if (collection === "education") return {focus: [], order: 0, status: "published"};
  if (collection === "research") return {rows: []};
  if (collection === "pages") return {learning: [], nextUp: {title: "", body: ""}};
  if (collection === "socialLinks" || collection === "projectCategories" || collection === "technologies") return {order: 0};
  return {};
}

export function FirestoreEditor({collection, id, content, revision, editorial, status, basePath, media}: {
  collection: string; id: string; content: RecordValue; revision: number; editorial: boolean; status?: string; basePath: string; media: Media[];
}) {
  const [state, action, pending] = useActionState(saveCmsDocument, {});
  const router = useRouter();
  const [draft, setDraft] = useState<RecordValue>({...defaultsFor(collection), ...content});
  const [dirty, setDirty] = useState(false);
  const [picture, setPicture] = useState(media[0]?.url ?? "");
  const groups = useMemo(() => groupsFor(collection, id), [collection, id]);
  const creating = !id;
  const primary = String(draft.slug ?? draft.title ?? draft.name ?? draft.institution ?? draft.label ?? "");
  const documentId = id || slugify(primary);
  const needsSlug = editorial || collection === "projectCategories" || collection === "technologies";
  const effectiveDraft = {...draft, ...(needsSlug && !draft.slug && documentId ? {slug: documentId} : {})};
  const update = (path: string, value: unknown) => {setDraft(before => setValue(before, path, value)); setDirty(true);};
  useEffect(() => {
    if (!state.success) return;
    if (creating) router.replace(`${basePath}${basePath.includes("?") ? "&" : "?"}edit=${encodeURIComponent(documentId)}`);
    else router.refresh();
  }, [state.success, router, creating, basePath, documentId]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault();};
    const warnOnLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank" || new URL(link.href).origin !== window.location.origin) return;
      if (!window.confirm("You have unsaved changes. Leave this page?")) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", warnOnLink, true);
    return () => {window.removeEventListener("beforeunload", warn); document.removeEventListener("click", warnOnLink, true);};
  }, [dirty]);
  function field(spec: Field, path = spec.key, override?: unknown) {
    const value = override ?? (spec.key === "slug" && !draft.slug ? documentId : getValue(draft, path));
    const inputId = `cms-${collection}-${path.replaceAll(".", "-")}`;
    const base = {id: inputId, name: path, required: spec.required, "aria-describedby": spec.hint ? `${inputId}-hint` : undefined};
    let control;
    if (spec.type === "textarea" || spec.type === "markdown") {
      control = <textarea {...base} rows={spec.type === "markdown" ? 18 : 5} value={String(value ?? "")} onChange={e => update(path, e.target.value)} />;
    } else if (spec.type === "image") {
      const current = String(value ?? "");
      control = <div className="cms-media-field">
        <select {...base} value={current} onChange={e => update(path, e.target.value)}>
          <option value="">Choose an image from the media library</option>
          {current && !media.some(item => item.url === current) && <option value={current}>Current image</option>}
          {media.map(item => <option key={item.url} value={item.url}>{item.name}</option>)}
        </select>
        {current && <div className="cms-media-preview"><Image src={current} alt={String(draft.alt ?? media.find(item => item.url === current)?.alt ?? "")} width={120} height={90} unoptimized={current.endsWith(".svg")} /><span>{media.find(item => item.url === current)?.name ?? "Selected image"}</span></div>}
        <div className="cms-field-assist"><Link href="/admin/media" target="_blank">Upload a new image ↗</Link><button type="button" onClick={() => router.refresh()}>Refresh library</button></div>
      </div>;
    } else if (spec.type === "select") {
      control = <select {...base} value={String(value ?? "published")} onChange={e => update(path, e.target.value)}>{spec.options?.map(option => <option key={option} value={option}>{option === "published" ? "Visible on website" : option === "draft" ? "Hidden from website" : option}</option>)}</select>;
    } else if (spec.type === "checkbox") {
      control = <input {...base} type="checkbox" checked={Boolean(value)} onChange={e => update(path, e.target.checked)} />;
    } else if (spec.type === "color") {
      control = <div className="cms-color-field"><input {...base} type="color" value={String(value ?? "#000000")} onChange={e => update(path, e.target.value)} /><input aria-label={`${spec.label} hex value`} pattern="#[0-9a-fA-F]{6}" value={String(value ?? "")} onChange={e => update(path, e.target.value)} /></div>;
    } else {
      control = <input {...base} type={spec.type === "number" ? "number" : spec.type === "email" ? "email" : spec.type === "url" ? "url" : "text"} min={spec.type === "number" ? 0 : undefined} step={spec.type === "number" ? 1 : undefined} readOnly={spec.key === "slug" && !creating} value={value === undefined || value === null ? "" : String(value)} onChange={e => update(path, spec.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />;
    }
    return <div className={`cms-field ${spec.span ? "cms-field-wide" : ""}`} key={path}><label htmlFor={inputId}>{spec.label}{spec.required && <span aria-hidden="true"> *</span>}</label>{control}{spec.hint && <small id={`${inputId}-hint`}>{spec.hint}</small>}</div>;
  }
  function repeat(group: NonNullable<Group["repeat"]>) {
    const rows = (getValue(draft, group.key) as unknown[] | undefined) ?? [];
    const replace = (next: unknown[]) => update(group.key, next);
    return <div className="cms-repeater">
      {rows.map((row, index) => <div className="cms-repeat-item" key={index}><div className="cms-repeat-head"><strong>{group.label} {index + 1}</strong><button type="button" onClick={() => replace(rows.filter((_, i) => i !== index))} aria-label={`Remove ${group.label.toLowerCase()} ${index + 1}`}>Remove</button></div>
        <div className="cms-fields">{group.columns.map((spec, column) => {
          const path = `${group.key}.${index}.${spec.key}`;
          const value = group.shape === "pair" ? (row as unknown[])[column] : group.shape === "string" ? row : (row as RecordValue)[spec.key];
          const updateItem = (next: unknown) => replace(rows.map((entry, i) => i !== index ? entry : group.shape === "pair" ? (entry as unknown[]).map((v, j) => j === column ? next : v) : group.shape === "string" ? next : {...entry as RecordValue, [spec.key]: next}));
          return <div className={`cms-field ${spec.span ? "cms-field-wide" : ""}`} key={path}><label htmlFor={path}>{spec.label}</label>{spec.type === "textarea" ? <textarea id={path} rows={4} value={String(value ?? "")} onChange={e => updateItem(e.target.value)} required={spec.required} /> : <input id={path} type={spec.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={e => updateItem(e.target.value)} required={spec.required} />}</div>;
        })}</div></div>)}
      {rows.length < (group.max ?? 100) && <button className="cms-add-row" type="button" onClick={() => replace([...rows, structuredClone(group.blank)])}>+ Add {group.label.toLowerCase()}</button>}
    </div>;
  }
  const preview = editorial && id ? (collection === "projects" ? `/work/${id}` : collection === "thoughts" ? `/thoughts/${id}` : `/research/${id}`) : null;
  return <form action={action} className="cms-editor-form">
    <input type="hidden" name="collection" value={collection} /><input type="hidden" name="id" value={documentId} /><input type="hidden" name="mode" value={creating ? "create" : "update"} /><input type="hidden" name="revision" value={revision} /><input type="hidden" name="payload" value={JSON.stringify(effectiveDraft)} />
    <div className="cms-editor-intro"><div><span className="cms-editor-kicker">{creating ? "NEW" : "EDITING"} {labelFor(collection).toUpperCase()}</span><h2>{creating ? `Add ${labelFor(collection)}` : String(content.title ?? content.name ?? content.institution ?? content.label ?? id)}</h2>{!creating && <p>Record address: {id}</p>}</div><div className="cms-editor-flags">{editorial && <span data-status={status}>{status === "published" ? "● Published" : "○ Draft"}</span>}{dirty && <span className="cms-unsaved">Unsaved changes</span>}</div></div>
    {groups.map((group, i) => <section className="cms-form-section" key={i}><div className="cms-form-section-title"><h3>{group.title}</h3>{group.note && <p>{group.note}</p>}</div>{group.fields && <div className="cms-fields">{group.fields.map(spec => field(spec))}</div>}{group.repeat && repeat(group.repeat)}</section>)}
    {collection === "thoughts" && media.length > 0 && <div className="cms-insert-media"><label htmlFor="cms-inline-image">Insert an image in the article</label><div><select id="cms-inline-image" value={picture} onChange={e => setPicture(e.target.value)}>{media.map(item => <option key={item.url} value={item.url}>{item.name}</option>)}</select><button type="button" onClick={() => {const selected = media.find(item => item.url === picture); if (selected) update("bodyMarkdown", `${String(draft.bodyMarkdown ?? "").trimEnd()}\n\n![${selected.alt}](${selected.url})\n\n`);}}>Insert image</button></div></div>}
    {state.error && <p role="alert" className="cms-firestore-error">{state.error}</p>}
    {state.success && <p role="status" className="cms-firestore-success">{state.success}</p>}
    <div className="cms-editor-actions"><div><button className="cms-primary-action" type="submit" name="intent" value="save" disabled={pending || !documentId}>{pending ? "Saving…" : editorial ? "Save draft" : "Save changes"}</button>{editorial && <button className="cms-publish-action" type="submit" name="intent" value="publish" disabled={pending || !documentId}>Publish changes</button>}{preview && status === "published" && <Link href={preview} target="_blank">View live page ↗</Link>}</div>{editorial && status === "published" && <button className="cms-unpublish-action" type="submit" name="intent" value="unpublish" disabled={pending} onClick={e => {if (!window.confirm("Hide this page from the public website?")) e.preventDefault();}}>Unpublish</button>}</div>
  </form>;
}
