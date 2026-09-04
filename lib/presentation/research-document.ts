export type ResearchSectionKey = "abstract" | "question" | "motivation" | "methodology" |
  "dataset" | "pipeline" | "models" | "experimental-setup" | "results" | "discussion" |
  "limitations" | "conclusion";

export type ResearchSection = {
  key: ResearchSectionKey | "additional";
  label: string;
  markdown: string;
};

const headings: Record<string, { key: ResearchSectionKey; label: string }> = {
  abstract: { key: "abstract", label: "Abstract" },
  "research-question": { key: "question", label: "Research Question" },
  question: { key: "question", label: "Research Question" },
  motivation: { key: "motivation", label: "Motivation" },
  methodology: { key: "methodology", label: "Methodology" },
  method: { key: "methodology", label: "Methodology" },
  methods: { key: "methodology", label: "Methodology" },
  dataset: { key: "dataset", label: "Dataset" },
  datasets: { key: "dataset", label: "Dataset" },
  "system-pipeline": { key: "pipeline", label: "System Pipeline" },
  pipeline: { key: "pipeline", label: "System Pipeline" },
  architecture: { key: "pipeline", label: "System Pipeline" },
  models: { key: "models", label: "Models" },
  model: { key: "models", label: "Models" },
  "experimental-setup": { key: "experimental-setup", label: "Experimental Setup" },
  experiment: { key: "experimental-setup", label: "Experimental Setup" },
  results: { key: "results", label: "Results" },
  findings: { key: "results", label: "Results" },
  discussion: { key: "discussion", label: "Discussion" },
  limitations: { key: "limitations", label: "Limitations" },
  limitation: { key: "limitations", label: "Limitations" },
  conclusion: { key: "conclusion", label: "Conclusion" },
  conclusions: { key: "conclusion", label: "Conclusion" },
};

function headingKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseResearchDocument(markdown: string): ResearchSection[] {
  const marker = /^##\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(marker)];
  const sections: ResearchSection[] = [];
  const introduction = markdown.slice(0, matches[0]?.index ?? markdown.length).trim();
  if (introduction) sections.push({ key: "abstract", label: "Abstract", markdown: introduction });

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = match[1].replace(/\s+#+\s*$/, "").trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const content = markdown.slice(start, end).trim();
    if (!content) continue;
    const known = headings[headingKey(title)];
    sections.push(known ? { ...known, markdown: content }
      : { key: "additional", label: title, markdown: content });
  }
  return sections;
}
