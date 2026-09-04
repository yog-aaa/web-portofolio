import type { CSSProperties, ReactNode } from "react";
import type { PublicProfile, PublicSiteSettings, PublicThemeSettings } from "@/lib/domain/content";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

type ThemeStyle = CSSProperties & Record<`--${string}`, string | undefined>;

export function PublicShell({ settings, theme, profile, children }:
  { settings: PublicSiteSettings | null; theme: PublicThemeSettings | null;
    profile: PublicProfile | null; children: ReactNode }) {
  const brand = settings?.brandName ?? profile?.displayName ?? "Site";
  const contact = profile?.socialLinks.find((item) => item.purpose === "contact");
  const themeStyle: ThemeStyle = {
    "--background": theme?.background ?? undefined,
    "--surface": theme?.surface ?? undefined,
    "--foreground": theme?.foreground ?? undefined,
    "--foreground-secondary": theme?.foreground ?? undefined,
    "--border": theme?.border ?? undefined,
    "--border-control": theme?.foreground ?? undefined,
    "--accent": theme?.accent ?? undefined,
    "--accent-deep": theme?.accent ?? undefined,
    "--accent-foreground": theme?.accentForeground ?? undefined,
    "--accent-soft": theme?.accentSoft ?? undefined,
    "--accent-very-soft": theme?.accentSoft ?? undefined,
    "--accent-secondary": theme?.accentSecondary ?? undefined,
    "--focus-ring": theme?.foreground ?? undefined,
    "--focus-ring-offset": theme?.surface ?? undefined,
  };
  return <div style={themeStyle} className="flex min-h-svh flex-col bg-background">
    <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-control bg-accent px-4 py-3 text-accent-foreground focus:translate-y-0">Skip to content</a>
    <Navbar brand={brand} contactHref={contact?.destination} contactLabel={settings?.contactCtaLabel} />
    {children}
    <Footer brand={brand} copy={settings?.footerCopy} location={profile?.location} socialLinks={profile?.socialLinks ?? []} />
  </div>;
}
