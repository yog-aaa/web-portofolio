import type { Metadata } from "next";
import { PublishedThoughtsPage as Page } from "@/components/porto-v2/thoughts-firestore";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Thoughts", description: "Notes on interfaces, AI-assisted development, and working systems."};
export default Page;
