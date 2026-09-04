import type { PublicSocialLink } from "@/lib/domain/content";
import { resolveSocialIconKey } from "@/lib/domain/social-icons";
import { SocialIcon } from "./social-icon";

export function SocialLinks({ links, tone = "default", compact = false }: {
  links: PublicSocialLink[];
  tone?: "default" | "inverse";
  compact?: boolean;
}) {
  const color = tone === "inverse" ? "text-accent-soft hover:text-accent-foreground" : "text-foreground-secondary hover:text-foreground";
  return <ul className={`flex flex-wrap ${compact ? "gap-2" : "gap-x-5 gap-y-3"}`}>
    {links.map((item) => <li key={item.id}>
      <a href={item.destination} rel={item.destination.startsWith("http") ? "noreferrer" : undefined}
        className={`transition-interactive inline-flex min-h-target items-center gap-2 ${color}`}>
        <SocialIcon icon={resolveSocialIconKey(item)} className="size-4 shrink-0" />
        <span className="text-caption font-medium">{item.label}</span>
        <span aria-hidden="true" className="text-caption">↗</span>
      </a>
    </li>)}
  </ul>;
}
