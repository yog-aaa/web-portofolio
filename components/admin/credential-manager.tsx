import Link from "next/link";
import { deleteCollectionAction, saveCredentialAction } from "@/app/admin/(protected)/actions";
import type { AdminCredential, AdminMediaOption } from "@/lib/repositories/admin-content";
import { AdminActionForm, ConfirmSubmit, SubmitButton } from "./admin-action-form";
import { AdminPageHeader } from "./admin-page-header";
import { AdminEmpty, AdminNotice, fieldClass, labelClass, StatusBadge } from "./admin-ui";
import { CheckboxField, MediaSelect, TextAreaField, TextField } from "./editor-fields";

const categories = ["AI", "Software", "Cloud", "Security", "Other"] as const;

function CredentialEditor({ item, media }: { item: AdminCredential | null; media: AdminMediaOption[] }) {
  return <section className="border-t border-border pt-7" aria-labelledby="credential-editor"><p className="type-metadata text-foreground-secondary">{item ? "EDIT CREDENTIAL" : "NEW CREDENTIAL"}</p><h2 id="credential-editor" className="mt-2 text-h3">{item?.title ?? "New credential"}</h2>
    <AdminActionForm action={saveCredentialAction} className="mt-8 space-y-8"><input type="hidden" name="id" value={item?.id ?? ""} /><input type="hidden" name="expectedUpdatedAt" value={item?.updatedAt.toISOString() ?? ""} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="title" label="Credential name" value={item?.title} required /><TextField name="issuerName" label="Issuer" value={item?.issuerName} required /></div>
      <div><label htmlFor="credentialType" className={labelClass}>Category</label><select id="credentialType" name="credentialType" defaultValue={item?.credentialType ?? "Other"} className={fieldClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
      <div className="grid gap-5 md:grid-cols-2"><TextField name="issueDate" label="Issue date" value={item?.issueDate} placeholder="YYYY-MM-DD" /><TextField name="expiryDate" label="Expiry date" value={item?.expiryDate} placeholder="YYYY-MM-DD" /></div>
      <TextField name="publicIdentifier" label="Credential ID" value={item?.publicIdentifier} />
      <TextField name="verificationUrl" label="Credential URL" type="url" value={item?.verificationUrl} placeholder="https://…" />
      <TextAreaField name="description" label="Description" value={item?.description} rows={4} />
      <MediaSelect name="previewMediaId" label="Preview media" options={media} selected={item?.previewMediaId} />
      <div className="grid gap-5 md:grid-cols-2"><TextField name="sortOrder" label="Sort order" type="number" value={item?.sortOrder ?? 0} /><CheckboxField name="isVisible" label="Visible publicly" checked={item?.isVisible} /></div>
      <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 border border-border-control bg-surface/95 p-3 shadow-sm backdrop-blur"><SubmitButton>Save credential</SubmitButton></div>
    </AdminActionForm>
    {item ? <AdminActionForm action={deleteCollectionAction} className="mt-5"><input type="hidden" name="type" value="credential" /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="expectedUpdatedAt" value={item.updatedAt.toISOString()} /><ConfirmSubmit message="Permanently delete this credential entry?">Delete credential</ConfirmSubmit></AdminActionForm> : null}
  </section>;
}

export function CredentialManager({ items, selected, media, notice, editorOpen }: { items: AdminCredential[]; selected: AdminCredential | null; media: AdminMediaOption[]; notice?: string; editorOpen: boolean }) {
  return <main className="pb-section"><AdminPageHeader eyebrow="CONTENT / CREDENTIALS" title="Credentials" description="Publish only verifiable credentials and keep unknown details empty." action={{ href: "/admin/credentials?new=1", label: "New credential" }} /><AdminNotice notice={notice} />
    <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(34rem,1.25fr)]"><section><h2 className="type-metadata mb-4 text-foreground-secondary">ALL CREDENTIALS · {items.length}</h2>{items.length ? <ol className="border-b border-border">{items.map((item) => <li key={item.id} className="border-t border-border py-5"><div className="flex items-start justify-between gap-4"><div><Link href={`/admin/credentials?edit=${item.id}`} className="font-medium hover:underline hover:underline-offset-4">{item.title}</Link><p className="mt-2 text-caption text-foreground-secondary">{item.issuerName} · {item.credentialType}</p></div><StatusBadge status={item.isVisible ? "visible" : "hidden"} /></div></li>)}</ol> : <AdminEmpty>No credentials have been added.</AdminEmpty>}</section>
      {editorOpen ? <CredentialEditor item={selected} media={media} /> : <aside className="border-t border-border pt-7 text-foreground-secondary">Select a credential to edit, or add a verified record.</aside>}</div></main>;
}
