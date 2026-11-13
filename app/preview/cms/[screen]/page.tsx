import { notFound } from "next/navigation";
import { CmsPreview, screens, type Screen } from "@/components/admin/cms-preview";

export const dynamic = "force-dynamic";
export default async function Page({ params }: PageProps<"/preview/cms/[screen]">) {
  const { screen } = await params;
  if (process.env.NODE_ENV !== "development" || !screens.includes(screen as Screen)) notFound();
  return <CmsPreview screen={screen as Screen} />;
}
