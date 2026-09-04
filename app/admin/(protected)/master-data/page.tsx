import { connection } from "next/server";
import { MasterDataManager } from "@/components/admin/master-data-manager";
import { getAdminContentService } from "@/lib/services/admin-content-server";

export default async function MasterDataPage({ searchParams }: PageProps<"/admin/master-data">) {
  await connection();
  const [data, query] = await Promise.all([getAdminContentService().masterData(), searchParams]);
  const notice = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  return <MasterDataManager {...data} notice={notice} />;
}
