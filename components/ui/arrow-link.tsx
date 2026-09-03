import Link from "next/link";
import type { ReactNode } from "react";

export function ArrowLink({ href, children, className = "", external = false }:
  { href: string; children: ReactNode; className?: string; external?: boolean }) {
  const styles = `group/link transition-interactive inline-flex min-h-target items-center gap-2 font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep ${className}`;
  const content = <>{children}<span aria-hidden="true" className="transition-transform duration-(--duration-fast) ease-calm group-hover/link:translate-x-0.5">↗</span></>;
  return external || /^(https?:|mailto:)/.test(href)
    ? <a className={styles} href={href} rel={href.startsWith("http") ? "noreferrer" : undefined}>{content}</a>
    : <Link className={styles} href={href}>{content}</Link>;
}
