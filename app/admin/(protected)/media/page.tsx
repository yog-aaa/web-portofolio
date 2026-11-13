import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { CmsMediaList } from "@/components/admin/cms-media-list";
import { getCmsCollection } from "@/lib/porto-v2/cms-firestore";

export default async function Page() {
  const assets = await getCmsCollection("mediaAssets");
  return <main className="cms-firestore-page cms-media-page"><AdminPageHeader eyebrow="CONTENT STUDIO" title="Media" description="Upload an image once, then select it directly from the editor." />
    <div className="cms-firestore-grid"><section className="cms-firestore-editor"><div className="cms-firestore-editor-head">Upload image</div><MediaUploadForm /></section>
    <section className="cms-firestore-editor"><div className="cms-firestore-editor-head">{assets.length} images in library</div><CmsMediaList items={assets.map(asset => ({id: asset.id, name: String(asset.data.filename ?? asset.id), url: String(asset.data.secureUrl), alt: String(asset.data.alt ?? ""), format: String(asset.data.format ?? "")}))} /></section></div>
  </main>;
}
