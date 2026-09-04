export type CaseStudySectionKey = "overview" | "problem" | "objective" | "role" | "approach" |
  "architecture" | "technology" | "challenges" | "results" | "learning";

export type CaseStudySection = {
  key: CaseStudySectionKey | "additional";
  label: string;
  markdown: string;
};

const headings: Record<string, { key: CaseStudySectionKey; label: string }> = {
  overview: { key: "overview", label: "Overview" },
  problem: { key: "problem", label: "Problem" },
  objective: { key: "objective", label: "Objective" },
  objectives: { key: "objective", label: "Objective" },
  role: { key: "role", label: "Role" },
  approach: { key: "approach", label: "Approach" },
  architecture: { key: "architecture", label: "Architecture" },
  "system-architecture": { key: "architecture", label: "Architecture" },
  technology: { key: "technology", label: "Technology" },
  technologies: { key: "technology", label: "Technology" },
  challenges: { key: "challenges", label: "Challenges" },
  results: { key: "results", label: "Results" },
  outcomes: { key: "results", label: "Results" },
  "what-i-learned": { key: "learning", label: "What I Learned" },
  learnings: { key: "learning", label: "What I Learned" },
};

function headingKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseProjectCaseStudy(markdown: string): CaseStudySection[] {
  const marker = /^##\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(marker)];
  const sections: CaseStudySection[] = [];
  const introduction = markdown.slice(0, matches[0]?.index ?? markdown.length).trim();
  if (introduction) sections.push({ key: "overview", label: "Overview", markdown: introduction });

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = match[1].replace(/\s+#+\s*$/, "").trim();
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = matches[index + 1]?.index ?? markdown.length;
    const content = markdown.slice(contentStart, contentEnd).trim();
    if (!content) continue;
    const known = headings[headingKey(title)];
    sections.push(known
      ? { ...known, markdown: content }
      : { key: "additional", label: title, markdown: content });
  }

  return sections;
}
