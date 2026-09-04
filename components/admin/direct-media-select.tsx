"use client";

import { useRef, useState } from "react";
import type { AdminMediaOption } from "@/lib/repositories/admin-content";
import type { MediaCategory } from "@/lib/domain/media";
import { fieldClass, helpClass, labelClass } from "./admin-ui";
import { uploadImageDirect } from "./direct-media-upload";

export function DirectMediaSelect({ name, label, category, options: initialOptions, selected, help }: {
  name: string;
  label: string;
  category: MediaCategory;
  options: AdminMediaOption[];
  selected?: string | null;
  help?: string;
}) {
  const [options, setOptions] = useState(initialOptions);
  const [value, setValue] = useState(selected ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !altText.trim()) { setMessage("Choose an image and provide alt text."); return; }
    setPending(true); setMessage("Uploading directly to Cloudinary…");
    try {
      const asset = await uploadImageDirect(file, { category, access: "public", altText });
      const option: AdminMediaOption = { id: asset.id, filename: asset.filename, category: asset.category,
        access: asset.access, width: asset.width, height: asset.height };
      setOptions((current) => [option, ...current.filter((item) => item.id !== option.id)]);
      setValue(option.id); setMessage("Uploaded, added to Media Library, and selected.");
      if (fileRef.current) fileRef.current.value = "";
      setAltText("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally { setPending(false); }
  }

  return <div>
    <label htmlFor={name} className={labelClass}>{label}</label>
    <select id={name} name={name} value={value} onChange={(event) => setValue(event.target.value)} className={fieldClass}>
      <option value="">No media</option>
      {options.map((item) => <option key={item.id} value={item.id}>{item.filename} · {item.access}</option>)}
    </select>
    <p className={helpClass}>{help ?? "Select an existing asset or upload a new public image below."}</p>
    <details className="mt-3 border-l border-border pl-4">
      <summary className="flex min-h-target cursor-pointer items-center text-caption font-medium text-accent-deep">Upload new image</summary>
      <div className="mt-3 grid gap-3">
        <div><label htmlFor={`${name}-direct-file`} className={labelClass}>Image file</label><input id={`${name}-direct-file`} ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-3 file:border-0 file:bg-transparent file:font-medium`} /></div>
        <div><label htmlFor={`${name}-direct-alt`} className={labelClass}>Alt text</label><input id={`${name}-direct-alt`} value={altText} onChange={(event) => setAltText(event.target.value)} className={fieldClass} placeholder={`Describe the ${label.toLowerCase()}`} /></div>
        <button type="button" onClick={() => void upload()} disabled={pending} className="transition-interactive min-h-target justify-self-start rounded-control border border-border-control px-4 py-2 text-caption font-medium hover:border-accent disabled:opacity-60">{pending ? "Uploading…" : "Upload and select"}</button>
        <p role="status" className="min-h-5 text-caption text-foreground-secondary">{message}</p>
      </div>
    </details>
  </div>;
}
