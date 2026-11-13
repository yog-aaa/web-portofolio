import type { Metadata } from "next";
import { PublishedResearchPage as Page } from "@/components/porto-v2/research-firestore";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Research", description: "Academic exploration of privacy-preserving fall detection."};
export default Page;
