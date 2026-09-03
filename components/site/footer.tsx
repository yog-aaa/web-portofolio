import Link from "next/link";
import type { PublicSocialLink } from "@/lib/domain/content";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";

const secondaryNavigation = [
  { label: "Work", href: "/work" }, { label: "Research", href: "/research" },
  { label: "Thoughts", href: "/thoughts" }, { label: "Credentials", href: "/credentials" },
];

export function Footer({ brand, copy, location, socialLinks }:
  { brand: string; copy?: string | null; location?: string | null; socialLinks: PublicSocialLink[] }) {
  return <footer className="bg-surface">
    <Container className="pb-8 pt-section-compact">
      <Divider />
      <div className="editorial-grid py-10 md:py-12">
        <div className="col-span-full md:col-span-4 lg:col-span-5">
          <Link href="/" className="text-h3">{brand}</Link>
          {copy ? <p className="mt-3 max-w-sm text-caption text-foreground-secondary">{copy}</p> : null}
        </div>
        <nav className="col-span-full mt-8 md:col-span-2 md:mt-0 lg:col-span-3" aria-label="Secondary navigation">
          <ul className="space-y-2">{secondaryNavigation.map((item) => <li key={item.href}>
            <Link className="transition-interactive text-caption text-foreground-secondary hover:text-foreground" href={item.href}>{item.label}</Link>
          </li>)}</ul>
        </nav>
        {socialLinks.length ? <nav className="col-span-full mt-8 md:col-span-2 md:mt-0 lg:col-span-4" aria-label="Social and contact links">
          <ul className="space-y-2 md:text-right">{socialLinks.map((item) => <li key={item.id}>
            <a className="transition-interactive text-caption text-foreground-secondary hover:text-foreground" href={item.destination}>
              {item.label}<span aria-hidden="true" className="ml-1">↗</span>
            </a>
          </li>)}</ul>
        </nav> : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="type-metadata text-foreground-secondary">{brand}</p>
        {location ? <p className="type-metadata text-foreground-secondary">{location}</p> : null}
      </div>
    </Container>
  </footer>;
}
