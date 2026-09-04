import { connection } from "next/server";
import { ProjectManager } from "@/components/admin/project-manager";
import { getAdminContentService } from "@/lib/services/admin-content-server";

const uuid = (value: string | undefined) => value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;

export default async function ProjectsAdmin({ searchParams }: PageProps<"/admin/projects">) {
  await connection();
  const query = await searchParams;
  const edit = uuid(Array.isArray(query.edit) ? query.edit[0] : query.edit);
  const creating = (Array.isArray(query.new) ? query.new[0] : query.new) === "1";
  const data = await getAdminContentService().projects(edit);
  return <ProjectManager {...data} categories={data.taxonomy.categories} technologies={data.taxonomy.technologies}
    notice={Array.isArray(query.notice) ? query.notice[0] : query.notice} editorOpen={creating || Boolean(data.selected)} />;
}
