import { deleteTaxonomyAction, saveTaxonomyAction } from "@/app/admin/(protected)/actions";
import type { AdminTaxonomyRecord } from "@/lib/repositories/admin-content";
import { AdminActionForm, ConfirmSubmit, SubmitButton } from "./admin-action-form";
import { AdminEmpty, AdminNotice, fieldClass, helpClass, labelClass } from "./admin-ui";
import { AdminPageHeader } from "./admin-page-header";

function fieldId(item: AdminTaxonomyRecord | null, kind: "category" | "technology", name: string) {
  return `${kind}-${item?.id ?? "new"}-${name}`;
}

function TaxonomyForm({ kind, item }: { kind: "category" | "technology"; item: AdminTaxonomyRecord | null }) {
  const prefix = (name: string) => fieldId(item, kind, name);
  return <AdminActionForm action={saveTaxonomyAction} className="space-y-5">
    <input type="hidden" name="kind" value={kind} />
    <input type="hidden" name="id" value={item?.id ?? ""} />
    <input type="hidden" name="expectedUpdatedAt" value={item?.updatedAt.toISOString() ?? ""} />
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label htmlFor={prefix("name")} className={labelClass}>Name</label><input id={prefix("name")} name="name"
        defaultValue={item?.name ?? ""} maxLength={80} required className={fieldClass} /></div>
      <div><label htmlFor={prefix("key")} className={labelClass}>Stable key</label><input id={prefix("key")} name="key"
        defaultValue={item?.key ?? ""} maxLength={80} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="lowercase-key"
        className={fieldClass} /><p className={helpClass}>Used by filters and URLs. Lowercase letters, numbers, and hyphens.</p></div>
    </div>
    {kind === "category" ? <div><label htmlFor={prefix("description")} className={labelClass}>Description</label>
      <textarea id={prefix("description")} name="description" defaultValue={item?.description ?? ""} maxLength={500}
        rows={3} className={`${fieldClass} resize-y`} /></div> : <div className="grid gap-5 sm:grid-cols-2">
      <div><label htmlFor={prefix("referenceUrl")} className={labelClass}>Reference URL</label><input id={prefix("referenceUrl")}
        name="referenceUrl" type="url" defaultValue={item?.referenceUrl ?? ""} placeholder="https://…" className={fieldClass} /></div>
      <div><label htmlFor={prefix("iconKey")} className={labelClass}>Icon key</label><input id={prefix("iconKey")}
        name="iconKey" defaultValue={item?.iconKey ?? ""} maxLength={80} placeholder="typescript" className={fieldClass} />
        <p className={helpClass}>Optional provider-neutral identifier for future icon rendering.</p></div>
    </div>}
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="w-32"><label htmlFor={prefix("sortOrder")} className={labelClass}>Sort order</label><input
        id={prefix("sortOrder")} name="sortOrder" type="number" min={0} max={1_000_000}
        defaultValue={item?.sortOrder ?? 0} required className={fieldClass} /></div>
      <SubmitButton tone={item ? "secondary" : "primary"}>{item ? "Save changes" : `Add ${kind}`}</SubmitButton>
    </div>
  </AdminActionForm>;
}

function TaxonomyItem({ item }: { item: AdminTaxonomyRecord }) {
  const usage = item.projectCount + item.researchCount;
  return <li className="border-t border-border py-5">
    <details>
      <summary className="flex min-h-target cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
        <span><span className="font-medium">{item.name}</span><span className="type-metadata mt-1 block text-foreground-secondary">{item.key}</span></span>
        <span className="text-right text-caption text-foreground-secondary">{item.projectCount} project{item.projectCount === 1 ? "" : "s"}
          {item.kind === "technology" ? ` · ${item.researchCount} research` : ""}</span>
      </summary>
      <div className="mt-5 border-l-2 border-border pl-4 sm:pl-6"><TaxonomyForm kind={item.kind} item={item} />
        {usage === 0 ? <AdminActionForm action={deleteTaxonomyAction} className="mt-5 border-t border-border pt-5">
          <input type="hidden" name="kind" value={item.kind} /><input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="expectedUpdatedAt" value={item.updatedAt.toISOString()} />
          <ConfirmSubmit message={`Delete ${item.name}? This cannot be undone.`}>Delete</ConfirmSubmit>
        </AdminActionForm> : <p className="mt-5 border-t border-border pt-4 text-caption text-foreground-secondary">
          Remove this item from its {usage === 1 ? "content entry" : `${usage} content entries`} before deleting it.</p>}
      </div>
    </details>
  </li>;
}

function TaxonomySection({ title, description, kind, items }: { title: string; description: string;
  kind: "category" | "technology"; items: AdminTaxonomyRecord[] }) {
  return <section aria-labelledby={`${kind}-heading`}>
    <div className="border-b border-border pb-5"><p className="type-metadata text-foreground-secondary">MASTER DATA</p>
      <h2 id={`${kind}-heading`} className="mt-2 text-h2">{title}</h2><p className="mt-3 max-w-prose text-body text-foreground-secondary">{description}</p></div>
    <details className="border-b border-border py-5"><summary className="type-metadata min-h-target cursor-pointer content-center text-accent-deep">
      ADD {kind.toUpperCase()}</summary><div className="mt-5"><TaxonomyForm kind={kind} item={null} /></div></details>
    {items.length ? <ol className="border-b border-border">{items.map((item) => <TaxonomyItem key={item.id} item={item} />)}</ol>
      : <AdminEmpty>No {title.toLowerCase()} yet.</AdminEmpty>}
  </section>;
}

export function MasterDataManager({ categories, technologies, notice }: {
  categories: AdminTaxonomyRecord[]; technologies: AdminTaxonomyRecord[]; notice?: string;
}) {
  return <main className="pb-section"><AdminPageHeader eyebrow="CONTENT SYSTEM" title="Master data"
    description="Manage reusable categories and technologies once, then assign them consistently across projects and research." />
    <AdminNotice notice={notice} />
    <div className="mt-10 grid gap-14 2xl:grid-cols-2">
      <TaxonomySection title="Project categories" kind="category" items={categories}
        description="Categories power the Work archive filters. Keys should remain stable after they are published." />
      <TaxonomySection title="Technologies" kind="technology" items={technologies}
        description="Technologies can be shared by projects and research. Optional metadata stays provider-neutral." />
    </div>
  </main>;
}
