import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FirestoreEditor } from "@/components/admin/firestore-editor";
import { CmsRecordList } from "@/components/admin/cms-record-list";
import { editableContent, getCmsCollection, type CmsCollection } from "@/lib/porto-v2/cms-firestore";

export async function CmsCollectionPage({collection, heading, selectedId, basePath, fixedId, embedded = false}: {
  collection: CmsCollection; heading: string; selectedId?: string; basePath: string; fixedId?: string; embedded?: boolean;
}) {
  const needsMedia = ["projects", "experiences", "thoughts"].includes(collection) || (collection === "site" && fixedId !== "theme");
  const [items, assets] = await Promise.all([getCmsCollection(collection), needsMedia ? getCmsCollection("mediaAssets") : Promise.resolve([])]);
  const id = fixedId ?? selectedId ?? items[0]?.id ?? "";
  const selected = items.find(item => item.id === id);
  const content = selected ? editableContent(collection, selected.data) as Record<string, unknown> : {};
  const editorial = ["projects", "thoughts", "research"].includes(collection);
  const title = (item: (typeof items)[number]) => String(item.data.title ?? item.data.name ?? item.data.institution ?? item.data.label ?? item.id);
  return <main className={`cms-firestore-page ${embedded ? "cms-embedded-page" : ""}`}>
    {embedded ? <h2 className="cms-embedded-title">{heading}</h2> : <AdminPageHeader eyebrow="CONTENT STUDIO" title={heading} description={editorial ? "Edit a draft, then publish when it is ready." : "Choose an item to update, or add a new one."} />}
    <div className="cms-firestore-grid" data-fixed={Boolean(fixedId)}>
      {!fixedId && <CmsRecordList items={items.map(item => ({id: item.id, title: title(item), subtitle: String(item.data.group ?? item.data.role ?? item.data.issuer ?? item.id), status: typeof item.data.status === "string" ? item.data.status : undefined}))} selectedId={id} basePath={basePath} noun={heading} />}
      <section className="cms-firestore-editor">
        {selectedId === "new" || fixedId || selected || items.length === 0 ? <FirestoreEditor key={`${collection}:${id}:${selected?.data.revision ?? 0}`} collection={collection} id={selectedId === "new" ? "" : id} content={selectedId === "new" ? {} : content} revision={selectedId === "new" ? 0 : Number(selected?.data.revision ?? 0)} editorial={editorial} status={String(selected?.data.status ?? "draft")} basePath={basePath} media={assets.map(asset => ({url: String(asset.data.secureUrl), alt: String(asset.data.alt ?? ""), name: String(asset.data.filename ?? asset.id), format: String(asset.data.format ?? "")}))} /> : <div className="cms-record-empty-state"><h2>Entry not found</h2><p>Choose an item from the list or add a new one.</p></div>}
      </section>
    </div>
  </main>;
}
