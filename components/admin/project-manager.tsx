import Link from "next/link";
import type { AdminMediaOption, AdminProject, AdminTaxonomyOption } from "@/lib/repositories/admin-content";
import { AdminActionForm, ConfirmSubmit, SubmitButton } from "./admin-action-form";
import { AdminEmpty, AdminNotice, StatusBadge } from "./admin-ui";
import { AdminPageHeader } from "./admin-page-header";
import { CheckboxField, LinksField, MediaSelect, TaxonomyChoices, TextAreaField, TextField } from "./editor-fields";
import { MarkdownEditor } from "./markdown-editor";
import { TaxonomyCreator } from "./taxonomy-creator";
import { DirectMediaSelect } from "./direct-media-select";
import { lifecycleAction, saveProjectAction } from "@/app/admin/(protected)/actions";

function Lifecycle({ item }: { item: AdminProject }) {
  return <div className="flex flex-wrap gap-2">
    {item.status === "published" ? <>
      <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="project" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} />
        <input type="hidden" name="operation" value={item.isFeatured ? "unfeature" : "feature"} /><SubmitButton tone="secondary">{item.isFeatured ? "Unfeature" : "Feature"}</SubmitButton></AdminActionForm>
      <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="project" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="unpublish" />
        <ConfirmSubmit tone="secondary" message="Return this project to draft and remove it from the public website?">Unpublish</ConfirmSubmit></AdminActionForm>
    </> : null}
    {item.status !== "archived" ? <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="project" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="archive" />
      <ConfirmSubmit message="Archive this project? It will immediately leave every public view.">Archive</ConfirmSubmit></AdminActionForm> :
      <AdminActionForm action={lifecycleAction} className=""><input type="hidden" name="type" value="project" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedRevision" value={item.revision} /><input type="hidden" name="operation" value="restore" />
        <SubmitButton tone="secondary">Restore draft</SubmitButton></AdminActionForm>}
  </div>;
}

function ProjectEditor({ item, categories, technologies, media }: {
  item: AdminProject | null; categories: AdminTaxonomyOption[]; technologies: AdminTaxonomyOption[]; media: AdminMediaOption[];
}) {
  const draft = item?.draft;
  if (item?.status === "archived") return <section className="border-t border-border pt-7"><h2 className="text-h3">{draft?.title}</h2><p className="mt-3 text-foreground-secondary">Restore this archived entry before editing it.</p><div className="mt-6"><Lifecycle item={item} /></div></section>;
  return <section aria-labelledby="project-editor" className="border-t border-border pt-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="type-metadata text-foreground-secondary">{item ? "EDIT PROJECT" : "NEW PROJECT"}</p><h2 id="project-editor" className="mt-2 text-h3">{draft?.title ?? "Untitled draft"}</h2></div>{item ? <StatusBadge status={item.status} /> : null}</div>
    <AdminActionForm action={saveProjectAction} className="mt-8 space-y-9">
      <input type="hidden" name="id" value={item?.id ?? ""} /><input type="hidden" name="expectedRevision" value={item?.revision ?? 0} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="title" label="Title" value={draft?.title} required />
        <TextField name="slug" label="Slug" value={draft?.slug} placeholder="project-slug" help="Lowercase letters, numbers, and hyphens." /></div>
      <TextAreaField name="summary" label="Summary" value={draft?.summary} rows={4} />
      <TextAreaField name="roleOrContribution" label="Role / contribution" value={draft?.roleOrContribution} rows={3} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="startDate" label="Start date" value={draft?.startDate} placeholder="YYYY or YYYY-MM" /><TextField name="endDate" label="End date" value={draft?.endDate} placeholder="YYYY or YYYY-MM" /></div>
      <TaxonomyChoices name="categoryIds" label="Categories" options={categories} selected={item?.categoryIds ?? []} />
      <TaxonomyChoices name="technologyIds" label="Technologies" options={technologies} selected={item?.technologyIds ?? []} />
      <MarkdownEditor initialValue={draft?.bodyMarkdown} help="Use H2 headings such as Overview, Problem, Approach, Results, and What I Learned." />
      <LinksField name="links" label="Project links" links={draft?.links} />
      <div className="grid gap-5 md:grid-cols-2"><DirectMediaSelect name="coverMediaId" label="Cover media" category="project" options={media} selected={item?.media.find((entry) => entry.role === "cover")?.id} />
        <MediaSelect name="galleryMediaIds" label="Gallery media" options={media} multiple selected={item?.media.filter((entry) => entry.role === "gallery").map((entry) => entry.id)} /></div>
      <fieldset className="border-t border-border pt-6"><legend className="type-metadata text-foreground-secondary">CURATION</legend>
        <div className="mt-3 grid gap-5 md:grid-cols-3"><TextField name="sortOrder" label="Sort order" type="number" value={draft?.sortOrder ?? 0} />
          <TextField name="featuredOrder" label="Featured order" type="number" value={draft?.featuredOrder ?? 0} />
          <CheckboxField name="isFeatured" label="Featured on homepage" checked={draft?.isFeatured} /></div></fieldset>
      <fieldset className="border-t border-border pt-6"><legend className="type-metadata text-foreground-secondary">SEARCH METADATA</legend>
        <div className="mt-4 space-y-5"><TextField name="seoTitle" label="SEO title" value={draft?.seoTitle} /><TextAreaField name="seoDescription" label="SEO description" value={draft?.seoDescription} rows={3} /></div></fieldset>
      <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 border border-border-control bg-surface/95 p-3 shadow-sm backdrop-blur">
        <SubmitButton name="intent" value="save" tone="secondary">Save private draft</SubmitButton><SubmitButton name="intent" value="publish">{item?.status === "published" ? "Publish changes" : "Publish"}</SubmitButton>
        {item?.status === "published" && item.publicSlug ? <Link href={`/work/${item.publicSlug}`} target="_blank" rel="noreferrer" aria-label="View published project (opens in a new tab)" className="inline-flex min-h-target items-center px-3 text-caption text-accent-deep underline underline-offset-4">View published ↗</Link> : null}
      </div>
    </AdminActionForm>
  </section>;
}

export function ProjectManager({ items, selected, categories, technologies, media, notice, editorOpen }: {
  items: AdminProject[]; selected: AdminProject | null; categories: AdminTaxonomyOption[];
  technologies: AdminTaxonomyOption[]; media: AdminMediaOption[]; notice?: string; editorOpen: boolean;
}) {
  return <main className="pb-section"><AdminPageHeader eyebrow="CONTENT / PROJECTS" title="Projects" description="Shape case studies privately, preview their Markdown, and publish only complete work." action={{ href: "/admin/projects?new=1", label: "New project" }} />
    <AdminNotice notice={notice} /><details className="mt-8 border-y border-border py-4"><summary className="type-metadata cursor-pointer text-foreground-secondary">MANAGE CATEGORIES & TECHNOLOGIES</summary><div className="mt-5 grid gap-5 md:grid-cols-2"><TaxonomyCreator kind="category" returnTo="projects" /><TaxonomyCreator kind="technology" returnTo="projects" /></div></details><div className="mt-10 grid gap-12 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(34rem,1.25fr)]">
      <section aria-labelledby="project-list"><h2 id="project-list" className="type-metadata mb-4 text-foreground-secondary">ALL PROJECTS · {items.length}</h2>
        {items.length ? <ol className="border-b border-border">{items.map((item) => <li key={item.id} className="border-t border-border py-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><Link href={`/admin/projects?edit=${item.id}`} className="font-medium hover:underline hover:underline-offset-4">{item.draft.title}</Link><p className="mt-2 truncate text-caption text-foreground-secondary">{item.draft.slug ?? "Slug pending"}</p></div><StatusBadge status={item.status} /></div><div className="mt-4"><Lifecycle item={item} /></div></li>)}</ol> : <AdminEmpty>No project entries yet.</AdminEmpty>}
      </section>{editorOpen ? <ProjectEditor item={selected} categories={categories} technologies={technologies} media={media} /> : <aside className="border-t border-border pt-7 text-foreground-secondary"><p>Select a project to edit, or create a private draft.</p></aside>}
    </div></main>;
}
