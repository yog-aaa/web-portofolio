import Link from "next/link";
import { lifecycleAction, saveThoughtAction } from "@/app/admin/(protected)/actions";
import type { AdminMediaOption, AdminThought } from "@/lib/repositories/admin-content";
import { splitThoughtDraft } from "@/lib/services/admin-content";
import { AdminActionForm, ConfirmSubmit, SubmitButton } from "./admin-action-form";
import { AdminPageHeader } from "./admin-page-header";
import { AdminEmpty, AdminNotice, StatusBadge } from "./admin-ui";
import { LinksField, MediaSelect, TextAreaField, TextField } from "./editor-fields";
import { MarkdownEditor } from "./markdown-editor";

function Lifecycle({ item }: { item: AdminThought }) {
  return <div className="flex flex-wrap gap-2">{item.status === "published" ? <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="thought" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="unpublish" /><ConfirmSubmit tone="secondary" message="Return this article to draft and remove it from the public website?">Unpublish</ConfirmSubmit></AdminActionForm> : null}
    {item.status !== "archived" ? <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="thought" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="archive" /><ConfirmSubmit message="Archive this article? It will immediately leave every public view.">Archive</ConfirmSubmit></AdminActionForm> :
      <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="thought" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="restore" /><SubmitButton tone="secondary">Restore draft</SubmitButton></AdminActionForm>}</div>;
}

function ThoughtEditor({ item, media }: { item: AdminThought | null; media: AdminMediaOption[] }) {
  const draft = item ? splitThoughtDraft(item.draft) : null;
  if (item?.status === "archived") return <section className="border-t border-border pt-7"><h2 className="text-h3">{draft?.title}</h2><p className="mt-3 text-foreground-secondary">Restore this archived article before editing it.</p><div className="mt-6"><Lifecycle item={item} /></div></section>;
  return <section className="border-t border-border pt-7" aria-labelledby="thought-editor"><div className="flex items-center justify-between gap-3"><div><p className="type-metadata text-foreground-secondary">{item ? "EDIT THOUGHT" : "NEW THOUGHT"}</p><h2 id="thought-editor" className="mt-2 text-h3">{draft?.title ?? "Untitled draft"}</h2></div>{item ? <StatusBadge status={item.status} /> : null}</div>
    <AdminActionForm action={saveThoughtAction} className="mt-8 space-y-9"><input type="hidden" name="id" value={item?.id ?? ""} /><input type="hidden" name="expectedRevision" value={item?.revision ?? 0} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="title" label="Title" value={draft?.title} required /><TextField name="slug" label="Slug" value={draft?.slug} placeholder="article-slug" /></div>
      <TextAreaField name="excerpt" label="Excerpt" value={draft?.excerpt} rows={4} />
      <TextField name="category" label="Category" value={draft?.category} placeholder="Systems" help="A short editorial label stored safely with the article." />
      <MarkdownEditor initialValue={draft?.bodyMarkdown} help="Preview uses the same raw-HTML-disabled renderer as the public article." />
      <LinksField name="references" label="References" links={draft?.references} />
      <MediaSelect name="coverMediaId" label="Cover media" options={media} selected={item?.media.find((entry) => entry.role === "cover")?.id} />
      <fieldset className="border-t border-border pt-6"><legend className="type-metadata text-foreground-secondary">SEARCH METADATA</legend><div className="mt-4 space-y-5"><TextField name="seoTitle" label="SEO title" value={draft?.seoTitle} /><TextAreaField name="seoDescription" label="SEO description" value={draft?.seoDescription} rows={3} /></div></fieldset>
      <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 border border-border-control bg-surface/95 p-3 shadow-sm backdrop-blur"><SubmitButton name="intent" value="save" tone="secondary">Save private draft</SubmitButton><SubmitButton name="intent" value="publish">{item?.status === "published" ? "Publish changes" : "Publish"}</SubmitButton>{item?.status === "published" && item.publicSlug ? <Link href={`/thoughts/${item.publicSlug}`} target="_blank" rel="noreferrer" aria-label="View published Thought (opens in a new tab)" className="inline-flex min-h-target items-center px-3 text-caption text-accent-deep underline underline-offset-4">View published ↗</Link> : null}</div>
    </AdminActionForm></section>;
}

export function ThoughtManager({ items, selected, media, notice, editorOpen }: { items: AdminThought[]; selected: AdminThought | null; media: AdminMediaOption[]; notice?: string; editorOpen: boolean }) {
  return <main className="pb-section"><AdminPageHeader eyebrow="CONTENT / THOUGHTS" title="Thoughts" description="Write in a quiet Markdown workspace, preview safely, and publish deliberately." action={{ href: "/admin/thoughts?new=1", label: "New thought" }} /><AdminNotice notice={notice} />
    <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(34rem,1.25fr)]"><section><h2 className="type-metadata mb-4 text-foreground-secondary">ALL THOUGHTS · {items.length}</h2>{items.length ? <ol className="border-b border-border">{items.map((item) => <li key={item.id} className="border-t border-border py-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><Link href={`/admin/thoughts?edit=${item.id}`} className="font-medium hover:underline hover:underline-offset-4">{item.draft.title}</Link><p className="mt-2 truncate text-caption text-foreground-secondary">{splitThoughtDraft(item.draft).category ?? "Uncategorized"}</p></div><StatusBadge status={item.status} /></div><div className="mt-4"><Lifecycle item={item} /></div></li>)}</ol> : <AdminEmpty>No Thoughts yet.</AdminEmpty>}</section>
      {editorOpen ? <ThoughtEditor item={selected} media={media} /> : <aside className="border-t border-border pt-7 text-foreground-secondary">Select an article to edit, or begin a private draft.</aside>}</div></main>;
}
