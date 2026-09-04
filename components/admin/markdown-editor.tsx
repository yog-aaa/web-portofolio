"use client";

import { useState } from "react";
import { SafeMarkdown } from "@/components/content/safe-markdown";
import { fieldClass, helpClass, labelClass } from "./admin-ui";

export function MarkdownEditor({ initialValue = "", label = "Content Markdown", help }: {
  initialValue?: string | null; label?: string; help?: string;
}) {
  const [markdown, setMarkdown] = useState(initialValue ?? "");
  const [preview, setPreview] = useState(false);
  return <div>
    <div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="bodyMarkdown" className={labelClass}>{label}</label>
      <button type="button" onClick={() => setPreview((value) => !value)} aria-pressed={preview}
        className="type-metadata min-h-target text-accent-deep underline underline-offset-4">{preview ? "EDIT" : "PREVIEW"}</button></div>
    {preview ? <div className="min-h-72 border-y border-border bg-background px-4 py-6"><SafeMarkdown markdown={markdown} headingContext="article" /></div>
      : <textarea id="bodyMarkdown" name="bodyMarkdown" rows={18} value={markdown} onChange={(event) => setMarkdown(event.target.value)}
        className={`${fieldClass} min-h-96 resize-y font-mono text-caption`} />}
    {preview ? <input type="hidden" name="bodyMarkdown" value={markdown} /> : null}
    <p className={helpClass}>{help ?? "Safe Markdown only. Raw HTML and executable MDX are never rendered."}</p>
  </div>;
}
