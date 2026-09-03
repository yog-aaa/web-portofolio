"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { MobileNavigation, type NavigationItem } from "./mobile-navigation";

const items: NavigationItem[] = [
  { label: "Work", href: "/work" },
  { label: "Experience", href: "/experience" },
  { label: "Research", href: "/research" },
  { label: "Thoughts", href: "/thoughts" },
  { label: "About", href: "/about" },
];

export function Navbar({ brand, contactHref, contactLabel }:
  { brand: string; contactHref?: string; contactLabel?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return <header className={`sticky top-0 z-50 transition-[background-color,border-color] duration-(--duration-normal) ease-calm ${scrolled ? "border-b border-border bg-background/95" : "border-b border-transparent bg-background"}`}>
    <Container className="flex min-h-20 items-center justify-between gap-8">
      <Link href="/" aria-label={`${brand} home`} className="text-lg font-semibold tracking-[-0.03em]">{brand}</Link>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
        {items.map((item) => <Link key={item.href} href={item.href}
          aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
          className={`transition-interactive relative flex min-h-target items-center text-caption font-medium after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-foreground after:transition-transform after:duration-(--duration-fast) ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}>
          {item.label}
        </Link>)}
        {contactHref && contactLabel ? <a href={contactHref}
          className="transition-interactive flex min-h-target items-center border-b border-border-control text-caption font-medium hover:border-foreground">
          {contactLabel}<span className="ml-1.5" aria-hidden="true">↗</span>
        </a> : null}
      </nav>
      <MobileNavigation items={items} pathname={pathname} contactHref={contactHref} contactLabel={contactLabel} />
    </Container>
  </header>;
}
