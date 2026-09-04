import { connection } from "next/server";
import { ThoughtManager } from "@/components/admin/thought-manager";
import { getAdminContentService } from "@/lib/services/admin-content-server";

const uuid = (value: string | undefined) => value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;

export default async function ThoughtsAdmin({ searchParams }: PageProps<"/admin/thoughts">) {
  await connection(); const query = await searchParams;
  const edit = uuid(Array.isArray(query.edit) ? query.edit[0] : query.edit);
  const creating = (Array.isArray(query.new) ? query.new[0] : query.new) === "1";
  const data = await getAdminContentService().thoughts(edit);
  return <ThoughtManager {...data} notice={Array.isArray(query.notice) ? query.notice[0] : query.notice} editorOpen={creating || Boolean(data.selected)} />;
}
