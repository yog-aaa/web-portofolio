import type { ReactNode } from "react";

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`type-metadata inline-flex min-h-7 items-center border border-border px-2.5 text-foreground-secondary ${className}`}>{children}</span>;
}
