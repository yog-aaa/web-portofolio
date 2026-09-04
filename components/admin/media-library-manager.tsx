"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mediaCategories, type MediaLibraryAsset } from "@/lib/domain/media";
import { fieldClass, helpClass, labelClass } from "./admin-ui";

function bytes(value: number | null) {
  if (value === null) return "Unknown size";
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 ** 2).toFixed(1)} MiB`;
}

function AssetImage({ asset, className = "" }: { asset: MediaLibraryAsset; className?: string }) {
  return asset.image ? <Image src={asset.image.src} width={asset.image.width} height={asset.image.height}
    alt={asset.image.alt} unoptimized={asset.access === "private"} className={`h-full w-full object-cover ${className}`} />
    : <div className={`grid h-full w-full place-items-center bg-accent-very-soft px-4 text-center type-metadata text-foreground-secondary ${className}`}>{asset.availability}</div>;
}

async function responseMessage(response: Response) {
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(body.message ?? "The media operation failed.");
  return body;
}

function AssetEditor({ asset, onUpdate, onDelete }: { asset: MediaLibraryAsset;
  onUpdate: (asset: MediaLibraryAsset) => void; onDelete: (id: string, message: string) => void }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const referenceCount = asset.references.reduce((total, item) => total + item.count, 0);

  async function verify() {
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/media/${asset.id}${asset.availability === "ready" ? "" : "/reconcile"}`,
        { method: asset.availability === "ready" ? "GET" : "POST" });
      const body = await responseMessage(response) as { asset: MediaLibraryAsset; references?: MediaLibraryAsset["references"] };
      onUpdate({ ...body.asset, references: body.references ?? asset.references });
      setMessage(asset.availability === "ready" ? "Cloudinary metadata verified." : "Upload reconciled and ready.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Metadata verification failed."); }
    finally { setPending(false); }
  }

  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "PATCH",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ altText: String(form.get("altText") ?? ""),
          caption: String(form.get("caption") ?? ""), isDecorative: form.get("isDecorative") === "on",
          expectedUpdatedAt: asset.updatedAt }) });
      const body = await responseMessage(response) as { asset: MediaLibraryAsset; references: MediaLibraryAsset["references"] };
      onUpdate({ ...body.asset, references: body.references }); setMessage("Metadata saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The media operation failed."); }
    finally { setPending(false); }
  }

  async function remove() {
    if (!window.confirm(`Delete ${asset.filename}? Cloudinary deletion only proceeds when the asset is unused.`)) return;
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "DELETE" });
      const body = await responseMessage(response) as { status?: string };
      onDelete(asset.id, body.status === "pending" ? "Asset removed from the library; Cloudinary deletion is queued for retry." : "Asset deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The media operation failed."); }
    finally { setPending(false); }
  }

  return <aside className="border-t border-border pt-6 xl:sticky xl:top-8 xl:border-l xl:border-t-0 xl:pl-8" aria-label="Selected media">
    <div className="aspect-[4/3] overflow-hidden border border-border bg-surface"><AssetImage asset={asset} /></div>
    <div className="mt-5 flex items-start justify-between gap-4"><div className="min-w-0">
      <h2 className="break-words text-h3">{asset.filename}</h2>
      <p className="type-metadata mt-2 text-foreground-secondary">{asset.width && asset.height ? `${asset.width} × ${asset.height} · ` : ""}{asset.mimeType ?? asset.format ?? asset.kind} · {bytes(asset.bytes)}</p>
      <p className="type-metadata mt-1 text-foreground-secondary">{asset.category ?? "uncategorized"} · {asset.access} · {asset.availability}</p>
    </div><button type="button" onClick={() => void navigator.clipboard.writeText(asset.id)
      .then(() => setMessage("Media ID copied.")).catch(() => setMessage("Copy failed. Select the ID below manually."))}
      className="min-h-target shrink-0 rounded-control border border-border-control px-3 text-caption hover:border-accent">Copy ID</button></div>
    <code className="mt-3 block select-all break-all text-caption text-foreground-secondary">{asset.id}</code>
    <p className="mt-4 text-caption text-foreground-secondary">{referenceCount ? `Used by ${referenceCount} content reference${referenceCount === 1 ? "" : "s"}.` : "Unused and eligible for safe deletion."}</p>
    {asset.references.length ? <ul className="mt-2 text-caption text-foreground-secondary">{asset.references.map((item) => <li key={item.source}>{item.source}: {item.count}</li>)}</ul> : null}
    <form onSubmit={save} className="mt-7 space-y-5">
      <div><label htmlFor={`alt-${asset.id}`} className={labelClass}>Alt text</label><textarea id={`alt-${asset.id}`} name="altText" defaultValue={asset.altText ?? ""} rows={3} className={fieldClass} />
        <p className={helpClass}>Required for informative public images.</p></div>
      <div><label htmlFor={`caption-${asset.id}`} className={labelClass}>Caption</label><textarea id={`caption-${asset.id}`} name="caption" defaultValue={asset.caption ?? ""} rows={3} className={fieldClass} /></div>
      <label className="flex min-h-target items-center gap-3 text-caption"><input type="checkbox" name="isDecorative" defaultChecked={asset.isDecorative} className="size-4 accent-[var(--accent)]" /> Decorative image</label>
      <p role="status" className="min-h-5 text-caption">{message}</p>
      <div className="flex flex-wrap gap-3"><button disabled={pending || asset.availability !== "ready"} className="min-h-target rounded-control bg-accent px-5 py-3 font-medium text-accent-foreground disabled:opacity-60">{pending ? "Working…" : "Save metadata"}</button>
        <button type="button" onClick={verify} disabled={pending}
          className="min-h-target rounded-control border border-border-control bg-surface px-5 py-3 font-medium hover:border-accent disabled:opacity-60">{asset.availability === "ready" ? "Verify metadata" : "Reconcile upload"}</button>
        <button type="button" onClick={remove} disabled={pending || referenceCount > 0 || asset.availability !== "ready"}
          className="min-h-target rounded-control border border-red-300 px-5 py-3 font-medium text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">Delete unused</button></div>
    </form>
  </aside>;
}

export function MediaLibraryManager({ initialAssets }: { initialAssets: MediaLibraryAsset[] }) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [selectedId, setSelectedId] = useState(initialAssets[0]?.id ?? "");
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [libraryMessage, setLibraryMessage] = useState("");
  const selected = assets.find((asset) => asset.id === selectedId) ?? null;
  const filtered = useMemo(() => filter === "all" ? assets : assets.filter((asset) => asset.category === filter), [assets, filter]);

  async function upload(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setUploading(true); setUploadMessage("");
    const form = event.currentTarget; const data = new FormData(form);
    data.set("isDecorative", String(data.get("isDecorative") === "on"));
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = await responseMessage(response) as { asset: MediaLibraryAsset };
      const uploaded = { ...body.asset, references: [] };
      setAssets((current) => [uploaded, ...current]); setSelectedId(uploaded.id);
      setUploadMessage("Upload complete and metadata verified."); form.reset(); router.refresh();
    } catch (error) { setUploadMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  return <div className="mt-10 space-y-12">
    <section aria-labelledby="upload-heading" className="border-y border-border bg-surface px-5 py-7 md:px-7">
      <h2 id="upload-heading" className="text-h3">Upload image</h2>
      <p className={helpClass}>JPEG, PNG, or WebP up to 3 MiB. Files are decoded, metadata-stripped, and stored inside the managed Cloudinary namespace.</p>
      <form onSubmit={upload} className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2"><label htmlFor="media-file" className={labelClass}>Image file</label><input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required className={`${fieldClass} file:mr-4 file:border-0 file:bg-transparent file:font-medium`} /></div>
        <div><label htmlFor="media-category" className={labelClass}>Category</label><select id="media-category" name="category" className={fieldClass}>{mediaCategories.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div><label htmlFor="media-access" className={labelClass}>Access</label><select id="media-access" name="access" className={fieldClass}><option value="private">Private draft</option><option value="public">Public delivery</option></select></div>
        <div className="md:col-span-2"><label htmlFor="upload-alt" className={labelClass}>Alt text</label><input id="upload-alt" name="altText" className={fieldClass} /></div>
        <div className="md:col-span-2"><label htmlFor="upload-caption" className={labelClass}>Caption</label><input id="upload-caption" name="caption" className={fieldClass} /></div>
        <label className="flex min-h-target items-center gap-3 text-caption"><input type="checkbox" name="isDecorative" className="size-4 accent-[var(--accent)]" /> Decorative image</label>
        <div className="flex items-end md:col-span-1 xl:col-start-4"><button disabled={uploading} className="min-h-target w-full rounded-control bg-accent px-5 py-3 font-medium text-accent-foreground disabled:opacity-60">{uploading ? "Uploading…" : "Upload"}</button></div>
        <p role="status" className="text-caption md:col-span-2 xl:col-span-4">{uploadMessage}</p>
      </form>
    </section>

    <section aria-labelledby="library-heading">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="type-metadata text-foreground-secondary">{assets.length} ASSET{assets.length === 1 ? "" : "S"}</p><h2 id="library-heading" className="mt-2 text-h3">Library</h2></div>
        <div><label htmlFor="media-filter" className={labelClass}>Filter category</label><select id="media-filter" value={filter} onChange={(event) => {
          const next = event.target.value; setFilter(next);
          const first = next === "all" ? assets[0] : assets.find((asset) => asset.category === next);
          setSelectedId(first?.id ?? "");
        }} className={`${fieldClass} min-w-44`}><option value="all">All</option>{mediaCategories.map((category) => <option key={category}>{category}</option>)}</select></div></div>
      <p role="status" className="mt-3 min-h-5 text-caption">{libraryMessage}</p>
      {assets.length ? <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <div className="border-t border-border">{filtered.map((asset) => <button type="button" key={asset.id} onClick={() => setSelectedId(asset.id)} aria-pressed={asset.id === selectedId}
          className={`grid w-full grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b px-2 py-4 text-left transition-colors sm:grid-cols-[7rem_minmax(0,1fr)_auto] ${asset.id === selectedId ? "border-accent bg-accent-very-soft" : "border-border hover:bg-surface"}`}>
          <span className="aspect-[4/3] overflow-hidden border border-border bg-surface"><AssetImage asset={asset} /></span>
          <span className="min-w-0 self-center"><span className="block truncate font-medium">{asset.filename}</span><span className="type-metadata mt-1 block text-foreground-secondary">{asset.category ?? "uncategorized"} · {asset.access}</span></span>
          <span className="type-metadata col-start-2 text-foreground-secondary sm:col-auto sm:self-center">{asset.width && asset.height ? `${asset.width} × ${asset.height}` : asset.availability}</span>
        </button>)}</div>
        {selected ? <AssetEditor key={selected.id + selected.updatedAt} asset={selected}
          onUpdate={(updated) => setAssets((current) => current.map((item) => item.id === updated.id ? updated : item))}
          onDelete={(id, message) => { const remaining = assets.filter((item) => item.id !== id);
            setAssets(remaining); setSelectedId(remaining[0]?.id ?? ""); setLibraryMessage(message); }} /> : null}
      </div> : <p className="mt-7 border-y border-border py-12 text-foreground-secondary">No media has been uploaded yet.</p>}
    </section>
  </div>;
}
