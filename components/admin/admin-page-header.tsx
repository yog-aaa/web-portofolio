import Link from "next/link";

export function AdminPageHeader({ eyebrow, title, description, action }: {
  eyebrow: string; title: string; description: string; action?: { href: string; label: string };
}) {
  return <header className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
    <div><p className="type-metadata text-foreground-secondary">{eyebrow}</p><h1 className="mt-3 text-h2">{title}</h1>
      <p className="mt-3 max-w-reading text-body text-foreground-secondary">{description}</p></div>
    {action ? <Link href={action.href} className="transition-interactive inline-flex min-h-target shrink-0 items-center justify-center rounded-control bg-accent px-5 py-3 font-medium text-accent-foreground hover:bg-accent-deep">{action.label}</Link> : null}
  </header>;
}
