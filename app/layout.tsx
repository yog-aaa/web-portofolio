import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { productionSiteUrl } from "@/lib/presentation/site-url";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.portoTheme=localStorage.getItem('porto-v2-theme')==='dark'?'dark':'light';document.documentElement.dataset.portoMotion=/^\\/(?:admin|preview)(?:\\/|$)/.test(location.pathname)?'system':'full';if(location.pathname==='/'||location.pathname===''){document.documentElement.dataset.portoIntro=sessionStorage.getItem('porto-v2-intro-seen')==='1'?'skip':'loading'}}catch{document.documentElement.dataset.portoIntro='skip'}" }} /></head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
