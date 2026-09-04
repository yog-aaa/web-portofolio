import type { AdminEditorialStatus } from "@/lib/repositories/admin-content";

export function StatusBadge({ status }: { status: AdminEditorialStatus | "visible" | "hidden" }) {
  const active = status === "published" || status === "visible";
  return <span className={`type-metadata inline-flex rounded-control border px-2 py-1 ${active
    ? "border-accent bg-accent-very-soft text-accent-deep" : "border-border-control text-foreground-secondary"}`}>{status.toUpperCase()}</span>;
}

const notices: Record<string, string> = {
  "draft-saved": "Private draft saved.", published: "Content published and public views refreshed.",
  archived: "Content archived and removed from public views.", restored: "Content restored to a private draft.",
  restore: "Content restored to a private draft.", unpublish: "Content returned to draft.",
  feature: "Content added to the featured selection.", unfeature: "Content removed from the featured selection.",
  saved: "Changes saved.", deleted: "Entry deleted.",
  "theme-reset": "Theme reset to the Calm Blue defaults.",
  "taxonomy-saved": "Master data saved.",
  "taxonomy-deleted": "Taxonomy item deleted.",
};

export function AdminNotice({ notice }: { notice?: string }) {
  const message = notice ? notices[notice] : null;
  return message ? <p role="status" className="mt-6 border-l-2 border-accent bg-accent-very-soft px-4 py-3 text-caption text-foreground">{message}</p> : null;
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return <div className="border-y border-border py-12 text-body text-foreground-secondary">{children}</div>;
}

export const fieldClass = "min-h-target w-full rounded-control border border-border-control bg-surface px-3 py-2 text-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";
export const labelClass = "mb-2 block text-caption font-medium text-foreground";
export const helpClass = "mt-2 text-caption text-foreground-secondary";
