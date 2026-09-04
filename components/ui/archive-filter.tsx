import Link from "next/link";

export type FilterOption = { key: string; label: string };

export function ArchiveFilter({ label, pathname, active, options }: {
  label: string; pathname: string; active: string; options: FilterOption[];
}) {
  return <nav aria-label={label} className="border-y border-border py-4">
    <ul className="flex flex-wrap gap-x-1 gap-y-2">
      {options.map((option) => {
        const selected = option.key === active;
        const href = option.key === "all" ? pathname : `${pathname}?filter=${option.key}`;
        return <li key={option.key} className="shrink-0"><Link href={href} aria-current={selected ? "page" : undefined}
          className={`transition-interactive inline-flex min-h-target items-center px-3 font-mono text-metadata uppercase tracking-[0.04em] ${selected
            ? "bg-accent-deep text-accent-foreground" : "text-foreground-secondary hover:bg-accent-soft hover:text-foreground"}`}>{option.label}</Link></li>;
      })}
    </ul>
  </nav>;
}
