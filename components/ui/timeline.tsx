import type { ReactNode } from "react";
import { TimelineReveal } from "./timeline-reveal";

export function Timeline({ children }: { children: ReactNode }) {
  return <TimelineReveal>{children}</TimelineReveal>;
}

export function TimelineItem({ metadata, current = false, children }: {
  metadata: ReactNode; current?: boolean; children: ReactNode;
}) {
  return <li className="group/timeline relative pl-8 md:pl-10">
    <span aria-hidden="true" className="absolute bottom-0 left-1.5 top-2 w-px bg-border transition-colors duration-300 group-hover/timeline:bg-accent-secondary group-focus-within/timeline:bg-accent-secondary" />
    <span aria-hidden="true" className={`absolute left-0 top-1.5 size-[13px] rounded-full border-2 border-accent bg-background transition-[transform,box-shadow,background-color] duration-300 group-hover/timeline:bg-accent-soft group-hover/timeline:ring-4 group-hover/timeline:ring-accent-soft group-focus-within/timeline:ring-4 group-focus-within/timeline:ring-accent-soft motion-safe:group-hover/timeline:scale-125 motion-safe:group-focus-within/timeline:scale-125 ${current ? "ring-4 ring-accent-soft" : ""}`}>
      {current ? <span className="absolute inset-0.5 rounded-full bg-accent" /> : null}
    </span>
    <div className="grid gap-x-8 gap-y-4 pb-10 group-last/timeline:pb-2 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:pb-12">
      <div className="min-w-0 text-foreground-secondary">{metadata}</div>
      <div className="relative isolate min-w-0 wrap-break-word before:pointer-events-none before:absolute before:-inset-x-4 before:-inset-y-3 before:-z-10 before:rounded-control before:bg-accent-very-soft before:opacity-0 before:transition-opacity before:duration-300 group-hover/timeline:before:opacity-100 group-focus-within/timeline:before:opacity-100">{children}</div>
    </div>
  </li>;
}

export function TimelineDetails({ label, children }: { label: string; children: ReactNode }) {
  return <details className="group/details mt-4">
    <summary className="transition-interactive inline-flex min-h-target cursor-pointer list-none items-center gap-3 text-caption font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep [&::-webkit-details-marker]:hidden">
      <span className="group-open/details:hidden">View details</span>
      <span className="hidden group-open/details:inline">Hide details</span>
      <span className="sr-only"> about {label}</span>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4 transition-transform duration-200 group-open/details:rotate-180">
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </summary>
    <div className="max-w-reading space-y-4 border-t border-border pt-4 text-foreground-secondary">{children}</div>
  </details>;
}
