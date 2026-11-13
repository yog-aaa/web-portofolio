import type { Metadata } from "next";
import { PortoLanding } from "@/components/porto-v2/landing";
import "@/components/porto-v2/landing.css";

export const metadata: Metadata = {
  title: "Yoga Agustiansyah — Software Developer & AI Explorer",
  description: "Explore selected software projects, teams, and current learning by Yoga Agustiansyah.",
};

export default function Page() {
  return <PortoLanding />;
}
