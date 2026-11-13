import type { Metadata } from "next";
import { CredentialsPage as Page } from "@/components/porto-v2/detail-pages";
export const metadata: Metadata = { title: "Credentials", description: "Certifications, assessments, skill badges, and completed courses." };
export default Page;
export const dynamic = "force-dynamic";
