import { addTaxonomyAction } from "@/app/admin/(protected)/actions";
import { AdminActionForm, SubmitButton } from "./admin-action-form";
import { fieldClass, labelClass } from "./admin-ui";

export function TaxonomyCreator({ kind, returnTo }: { kind: "category" | "technology"; returnTo: "projects" | "research" }) {
  return <AdminActionForm action={addTaxonomyAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
    <input type="hidden" name="kind" value={kind} /><input type="hidden" name="returnTo" value={returnTo} />
    <div className="flex-1"><label htmlFor={`${returnTo}-${kind}`} className={labelClass}>New {kind}</label><input id={`${returnTo}-${kind}`} name="name" required maxLength={80} className={fieldClass} /></div>
    <SubmitButton tone="secondary">Add</SubmitButton>
  </AdminActionForm>;
}
