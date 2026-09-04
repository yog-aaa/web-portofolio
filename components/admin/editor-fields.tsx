import type { AdminMediaOption, AdminTaxonomyOption } from "@/lib/repositories/admin-content";
import { fieldClass, helpClass, labelClass } from "./admin-ui";

export function TextField({ name, label, value, required, type = "text", placeholder, help }: {
  name: string; label: string; value?: string | number | null; required?: boolean;
  type?: "text" | "url" | "number"; placeholder?: string; help?: string;
}) {
  return <div><label htmlFor={name} className={labelClass}>{label}</label><input id={name} name={name} type={type}
    defaultValue={value ?? ""} required={required} placeholder={placeholder} min={type === "number" ? 0 : undefined}
    className={fieldClass} />{help ? <p className={helpClass}>{help}</p> : null}</div>;
}

export function TextAreaField({ name, label, value, required, rows = 4, help }: {
  name: string; label: string; value?: string | null; required?: boolean; rows?: number; help?: string;
}) {
  return <div><label htmlFor={name} className={labelClass}>{label}</label><textarea id={name} name={name}
    defaultValue={value ?? ""} required={required} rows={rows} className={`${fieldClass} resize-y`} />
    {help ? <p className={helpClass}>{help}</p> : null}</div>;
}

export function CheckboxField({ name, label, checked, help }: { name: string; label: string; checked?: boolean; help?: string }) {
  return <label className="flex gap-3 border-t border-border py-3"><input name={name} type="checkbox" defaultChecked={checked}
    className="mt-1 size-4 accent-accent" /><span><span className="block text-caption font-medium">{label}</span>{help ? <span className={helpClass}>{help}</span> : null}</span></label>;
}

export function TaxonomyChoices({ name, label, options, selected }: { name: string; label: string; options: AdminTaxonomyOption[]; selected: string[] }) {
  return <fieldset><legend className={labelClass}>{label}</legend>{options.length ? <div className="grid gap-x-5 sm:grid-cols-2">
    {options.map((item) => <label key={item.id} className="flex min-h-target items-center gap-3 border-t border-border py-2 text-caption">
      <input type="checkbox" name={name} value={item.id} defaultChecked={selected.includes(item.id)} className="size-4 accent-accent" />{item.name}
    </label>)}</div> : <p className={helpClass}>No options exist yet. Add taxonomy through the development seed before publishing.</p>}</fieldset>;
}

export function MediaSelect({ name, label, options, selected, multiple, help }: {
  name: string; label: string; options: AdminMediaOption[]; selected?: string | string[] | null; multiple?: boolean; help?: string;
}) {
  const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return <div><label htmlFor={name} className={labelClass}>{label}</label><select id={name} name={name} multiple={multiple}
    defaultValue={multiple ? values : values[0] ?? ""} className={`${fieldClass} ${multiple ? "min-h-40" : ""}`}>
    {!multiple ? <option value="">No media</option> : null}
    {options.map((item) => <option key={item.id} value={item.id}>{item.filename} · {item.access}</option>)}
  </select><p className={helpClass}>{help ?? (multiple ? "Use Ctrl/Cmd to select multiple assets." : "Only ready image assets are listed.")}</p></div>;
}

export function LinksField({ name, label, links }: { name: string; label: string; links?: { label: string; url: string }[] }) {
  return <TextAreaField name={name} label={label} rows={5} value={(links ?? []).map((item) => `${item.label} | ${item.url}`).join("\n")}
    help="One per line: Label | https://example.com" />;
}
