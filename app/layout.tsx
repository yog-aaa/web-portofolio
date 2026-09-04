import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { productionSiteUrl } from "@/lib/presentation/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: productionSiteUrl,
  title: { default: "Yoga Agustiansyah — Software, AI & Research", template: "%s — YOGAAA." },
  description: "The personal website of Yoga Agustiansyah, featuring software, artificial intelligence, and research work.",
  applicationName: "YOGAAA.",
  authors: [{ name: "Yoga Agustiansyah", url: productionSiteUrl }],
  creator: "Yoga Agustiansyah",
  publisher: "Yoga Agustiansyah",
  alternates: { canonical: productionSiteUrl },
  openGraph: {
    type: "website",
    url: productionSiteUrl,
    siteName: "YOGAAA.",
    title: "Yoga Agustiansyah — Software, AI & Research",
    description: "The personal website of Yoga Agustiansyah, featuring software, artificial intelligence, and research work.",
  },
  twitter: {
    card: "summary",
    title: "Yoga Agustiansyah — Software, AI & Research",
    description: "The personal website of Yoga Agustiansyah, featuring software, artificial intelligence, and research work.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
