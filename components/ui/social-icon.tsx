import type { SVGProps } from "react";
import type { SocialIconKey } from "@/lib/domain/social-icons";

const brandPaths: Partial<Record<SocialIconKey, string>> = {
  github: "M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.5v-2.1c-3.3.7-4-1.4-4-1.4-.6-1.5-1.4-1.9-1.4-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 2.9 1.4 3.6 1.1.1-.8.4-1.4.7-1.7-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.3-3.3c-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.4 1.3a11.8 11.8 0 0 1 6.2 0C17.2 5 18.2 5.3 18.2 5.3c.7 1.7.3 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5A11.3 11.3 0 0 0 12 .7Z",
  linkedin: "M5.3 7.8H1.7V22h3.6V7.8ZM3.5 2A2.1 2.1 0 1 0 3.5 6.2 2.1 2.1 0 0 0 3.5 2ZM22 13.9c0-4.3-2.3-6.4-5.4-6.4a4.7 4.7 0 0 0-4.2 2.3v-2h-3.6V22h3.6v-7c0-1.9.4-3.7 2.7-3.7s2.3 2.1 2.3 3.8V22H22v-8.1Z",
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm10.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  x: "M3 3h4.7l5.1 6.8L18.7 3H21l-7.1 8.4L21.5 21h-4.7l-5.7-7.5L4.7 21H2.4l7.6-9L3 3Zm3.6 2 11.2 14h1.1L7.7 5H6.6Z",
  youtube: "M23 12s0-3.5-.4-5.2a3 3 0 0 0-2.1-2.1C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.5a3 3 0 0 0-2.1 2.1C1 8.5 1 12 1 12s0 3.5.4 5.2a3 3 0 0 0 2.1 2.1c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a3 3 0 0 0 2.1-2.1C23 15.5 23 12 23 12Zm-13.2 4V8l6.3 4-6.3 4Z",
  facebook: "M14 22v-9h3l.5-3H14V8.1c0-.9.3-1.6 1.8-1.6H18V3.8c-.4-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V10H8v3h3v9h3Z",
  medium: "M2 5.5 4.5 8v8L2 18.5V19h7v-.5L6.5 16V8.8l6 10.2h.8l5.1-10.2v8.5l-1.8 1.2v.5H23v-.5l-1.7-1.2V6.7L23 5.5V5h-5.1l-4.5 9-5.3-9H2v.5Z",
};

export function SocialIcon({ icon, ...props }: { icon: SocialIconKey } & SVGProps<SVGSVGElement>) {
  const path = brandPaths[icon];
  if (path) return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d={path} /></svg>;
  if (icon === "email") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><rect x="2.5" y="4.5" width="19" height="15" rx="1"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>;
  if (icon === "orcid") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9.5"/><path d="M9 9v7M9 6.8v.2M12 9h1.5a3.5 3.5 0 0 1 0 7H12V9Z"/></svg>;
  if (icon === "google-scholar") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.5V16c3 2.7 9 2.7 12 0v-4.5M21 10v6"/></svg>;
  if (icon === "researchgate") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9.5"/><path d="M8 17V7h4a3 3 0 0 1 0 6H8m4 0 4 4"/></svg>;
  if (icon === "tiktok") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><path d="M14 4v11.5a4.5 4.5 0 1 1-3.5-4.4M14 4c.8 3 2.4 4.5 5 4.8"/></svg>;
  if (icon === "discord") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><path d="M7 7c3.5-1.5 6.5-1.5 10 0 1.4 2 2.3 4.6 2.5 7.5-2 1.5-3.6 2.2-5.1 2.5l-1-1.5M7 7c-1.4 2-2.3 4.6-2.5 7.5 2 1.5 3.6 2.2 5.1 2.5l1-1.5"/><circle cx="9.5" cy="12.5" r=".75" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12.5" r=".75" fill="currentColor" stroke="none"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><path d="M9.5 14.5 14.5 9M7.5 16.5l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.5 7.5l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"/></svg>;
}
