import { CmsCollectionPage } from "@/components/admin/cms-collection-page";
export default function Page() { return <><CmsCollectionPage collection="site" heading="Homepage & profile" fixedId="settings" basePath="/admin/homepage" /><CmsCollectionPage collection="pages" heading="Section copy" fixedId="homepage" basePath="/admin/homepage" embedded /></>; }
