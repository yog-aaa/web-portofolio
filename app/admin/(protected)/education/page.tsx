import { CmsCollectionPage } from "@/components/admin/cms-collection-page";
export default async function Page({searchParams}: {searchParams: Promise<{edit?: string}>}) { const {edit} = await searchParams; return <CmsCollectionPage collection="education" heading="Education" selectedId={edit} basePath="/admin/education" />; }
