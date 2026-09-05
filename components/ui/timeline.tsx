import type { ReactNode } from "react";

export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="border-y border-border py-8 md:py-10">{children}</ol>;
}

export function TimelineItem({ metadata, current = false, children }: {
  metadata: ReactNode; current?: boolean; children: ReactNode;
}) {
  return <li className="group/timeline relative pl-8 md:pl-10">
    <span aria-hidden="true" className="absolute bottom-0 left-1.5 top-2 w-px bg-border" />
    <span aria-hidden="true" className={`absolute left-0 top-1.5 size-[13px] rounded-full border-2 border-accent bg-background ${current ? "ring-4 ring-accent-soft" : ""}`}>
      {current ? <span className="absolute inset-0.5 rounded-full bg-accent" /> : null}
    </span>
    <div className="grid gap-x-8 gap-y-4 pb-10 group-last/timeline:pb-2 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:pb-12">
      <div className="min-w-0 text-foreground-secondary">{metadata}</div>
      <div className="min-w-0 wrap-break-word">{children}</div>
    </div>
  </li>;
}
