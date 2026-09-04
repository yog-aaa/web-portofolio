export type ThoughtDocument = {
  bodyMarkdown: string;
  category: string | null;
  readingMinutes: number;
};

const frontmatter = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function parseThoughtDocument(markdown: string): ThoughtDocument {
  const match = markdown.match(frontmatter);
  let bodyMarkdown = markdown;
  let category: string | null = null;
  if (match) {
    bodyMarkdown = markdown.slice(match[0].length).trimStart();
    for (const line of match[1].split(/\r?\n/)) {
      const categoryMatch = line.match(/^category:\s*(.+)$/i);
      const value = categoryMatch?.[1].trim();
      if (value && value.length <= 80 && !/[<>]/.test(value)) category = value;
    }
  }
  const plainText = bodyMarkdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|\-]+/g, " ");
  const words = plainText.trim().match(/\S+/g)?.length ?? 0;
  return { bodyMarkdown, category, readingMinutes: Math.max(1, Math.ceil(words / 220)) };
}
