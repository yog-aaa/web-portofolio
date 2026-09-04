import Link from "next/link";
import { deleteCollectionAction, saveExperienceAction } from "@/app/admin/(protected)/actions";
import type { AdminExperience } from "@/lib/repositories/admin-content";
import { AdminActionForm, ConfirmSubmit, SubmitButton } from "./admin-action-form";
import { AdminPageHeader } from "./admin-page-header";
import { AdminEmpty, AdminNotice, fieldClass, labelClass, StatusBadge } from "./admin-ui";
import { CheckboxField, TextAreaField, TextField } from "./editor-fields";

const categories = ["Professional", "Organization", "Community", "Freelance / Project"] as const;

function ExperienceEditor({ item }: { item: AdminExperience | null }) {
  return <section className="border-t border-border pt-7" aria-labelledby="experience-editor"><p className="type-metadata text-foreground-secondary">{item ? "EDIT EXPERIENCE" : "NEW EXPERIENCE"}</p><h2 id="experience-editor" className="mt-2 text-h3">{item?.roleTitle ?? "New entry"}</h2>
    <AdminActionForm action={saveExperienceAction} className="mt-8 space-y-8"><input type="hidden" name="id" value={item?.id ?? ""} /><input type="hidden" name="expectedUpdatedAt" value={item?.updatedAt.toISOString() ?? ""} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="roleTitle" label="Role / title" value={item?.roleTitle} required /><TextField name="organizationName" label="Organization" value={item?.organizationName} required /></div>
      <div><label htmlFor="contextLabel" className={labelClass}>Category</label><select id="contextLabel" name="contextLabel" defaultValue={item?.contextLabel ?? "Professional"} className={fieldClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
      <div className="grid gap-5 md:grid-cols-2"><TextField name="startDate" label="Start date" value={item?.startDate} placeholder="YYYY-MM" required /><TextField name="endDate" label="End date" value={item?.endDate} placeholder="YYYY-MM" /></div>
      <CheckboxField name="isCurrent" label="Current role" checked={item?.isCurrent} help="Current entries do not use an end date." />
      <TextAreaField name="description" label="Description" value={item?.description} required rows={5} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="location" label="Location" value={item?.location} /><TextField name="organizationUrl" label="Organization URL" type="url" value={item?.organizationUrl} placeholder="https://…" /></div>
      <div className="grid gap-5 md:grid-cols-3"><TextField name="sortOrder" label="Sort order" type="number" value={item?.sortOrder ?? 0} /><CheckboxField name="isVisible" label="Visible publicly" checked={item?.isVisible} /><CheckboxField name="isFeatured" label="Homepage highlight" checked={item?.isFeatured} /></div>
      <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 border border-border-control bg-surface/95 p-3 shadow-sm backdrop-blur"><SubmitButton>Save experience</SubmitButton></div>
    </AdminActionForm>
    {item ? <AdminActionForm action={deleteCollectionAction} className="mt-5"><input type="hidden" name="type" value="experience" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedUpdatedAt" value={item.updatedAt.toISOString()} /><ConfirmSubmit message="Permanently delete this experience entry?">Delete experience</ConfirmSubmit></AdminActionForm> : null}
  </section>;
}

export function ExperienceManager({ items, selected, notice, editorOpen }: { items: AdminExperience[]; selected: AdminExperience | null; notice?: string; editorOpen: boolean }) {
  return <main className="pb-section"><AdminPageHeader eyebrow="CONTENT / EXPERIENCE" title="Experience" description="Maintain a concise chronology and decide exactly which entries are public." action={{ href: "/admin/experience?new=1", label: "New experience" }} /><AdminNotice notice={notice} />
    <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(34rem,1.25fr)]"><section><h2 className="type-metadata mb-4 text-foreground-secondary">ALL EXPERIENCE · {items.length}</h2>{items.length ? <ol className="border-b border-border">{items.map((item) => <li key={item.id} className="border-t border-border py-5"><div className="flex items-start justify-between gap-4"><div><Link href={`/admin/experience?edit=${item.id}`} className="font-medium hover:underline hover:underline-offset-4">{item.roleTitle}</Link><p className="mt-2 text-caption text-foreground-secondary">{item.organizationName} · {item.contextLabel ?? "Uncategorized"}</p></div><StatusBadge status={item.isVisible ? "visible" : "hidden"} /></div></li>)}</ol> : <AdminEmpty>No experience entries yet.</AdminEmpty>}</section>
      {editorOpen ? <ExperienceEditor item={selected} /> : <aside className="border-t border-border pt-7 text-foreground-secondary">Select an entry to edit, or add verified experience.</aside>}</div></main>;
}
