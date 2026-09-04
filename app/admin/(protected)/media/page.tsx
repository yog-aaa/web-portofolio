import { headers } from "next/headers";
import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaLibraryManager } from "@/components/admin/media-library-manager";
import { getMediaService } from "@/lib/services/media/server";

export default async function MediaPage() {
  await connection();
  const service = await getMediaService(await headers());
  const assets = await service.list();
  return <main><AdminPageHeader eyebrow="ASSETS" title="Media" description="Upload, inspect, describe, select, and safely remove images from the managed Cloudinary library." />
    <MediaLibraryManager initialAssets={assets} />
  </main>;
}
