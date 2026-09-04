export const socialIconOptions = [
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "discord", label: "Discord" },
  { key: "medium", label: "Medium" },
  { key: "researchgate", label: "ResearchGate" },
  { key: "orcid", label: "ORCID" },
  { key: "google-scholar", label: "Google Scholar" },
  { key: "link", label: "Other link" },
] as const;

export type SocialIconKey = (typeof socialIconOptions)[number]["key"];

const keys = new Set<string>(socialIconOptions.map((option) => option.key));

export function isSocialIconKey(value: string | null | undefined): value is SocialIconKey {
  return Boolean(value && keys.has(value));
}

export function inferSocialIconKey(label: string, destination: string): SocialIconKey {
  if (destination.startsWith("mailto:")) return "email";
  const haystack = `${label} ${destination}`.toLowerCase();
  const patterns: Array<[SocialIconKey, RegExp]> = [
    ["github", /github/], ["linkedin", /linkedin/], ["instagram", /instagram/],
    ["x", /(?:twitter\.com|x\.com|\btwitter\b)/], ["youtube", /youtu(?:be|\.be)/],
    ["facebook", /facebook|fb\.com/], ["tiktok", /tiktok/], ["discord", /discord/],
    ["medium", /medium/], ["researchgate", /researchgate/], ["orcid", /orcid/],
    ["google-scholar", /scholar\.google|google scholar/],
  ];
  return patterns.find(([, pattern]) => pattern.test(haystack))?.[0] ?? "link";
}

export function resolveSocialIconKey(value: {
  label: string;
  destination: string;
  platformKey?: string | null;
}): SocialIconKey {
  return isSocialIconKey(value.platformKey) ? value.platformKey : inferSocialIconKey(value.label, value.destination);
}
