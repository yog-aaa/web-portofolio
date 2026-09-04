import "server-only";

export const publicContentTags = {
  site: "public-content:site",
  pages: "public-content:pages",
  theme: "public-content:theme",
  profile: "public-content:profile",
  projects: "public-content:projects",
  experience: "public-content:experience",
  research: "public-content:research",
  thoughts: "public-content:thoughts",
  credentials: "public-content:credentials",
} as const;

export const allPublicContentTags = Object.values(publicContentTags);
