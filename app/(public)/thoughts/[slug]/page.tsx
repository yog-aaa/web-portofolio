import { notFound } from "next/navigation";
import { ThoughtPreviewPage } from "@/components/porto-v2/detail-pages";
export default async function Page({ params }: PageProps<"/thoughts/[slug]">) {
  const { slug } = await params;
  if (slug !== "the-interface-is-part-of-the-work" || process.env.NODE_ENV !== "development") notFound();
  return <ThoughtPreviewPage />;
}
