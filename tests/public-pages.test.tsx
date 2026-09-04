import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SafeMarkdown } from "../components/content/safe-markdown";
import { ProjectCaseStudy } from "../components/work/project-case-study";
import { ResearchDetail } from "../components/research/research-detail";
import { ThoughtArticle } from "../components/thoughts/thought-article";
import { filterProjects, resolveWorkFilter } from "../components/work/work-archive";
import { parseProjectCaseStudy } from "../lib/presentation/project-case-study";
import { parseResearchDocument } from "../lib/presentation/research-document";
import { parseThoughtDocument } from "../lib/presentation/thought-document";
import type { PublicMediaReference, PublicProject, PublicResearchDetail, PublicThought, PublicThoughtDetail } from "../lib/domain/content";

const project = (categories: { key: string; name: string }[]): PublicProject => ({
  id: "00000000-0000-4000-8000-000000000001", slug: "example", title: "Example",
  summary: "Summary", roleOrContribution: "Role", startDate: null, endDate: null,
  collaborators: [], links: [], categories, technologies: [], cover: null,
  publishedAt: "2026-01-01T00:00:00.000Z", publicUpdatedAt: "2026-01-01T00:00:00.000Z",
});

test("work filters rely on published taxonomy labels and reject unknown URL state", () => {
  const ai = project([{ key: "computer-vision", name: "Computer Vision" }]);
  const software = { ...project([{ key: "software", name: "Software" }]), id: "00000000-0000-4000-8000-000000000002" };
  assert.deepEqual(filterProjects([ai, software], "ai").map((item) => item.id), [ai.id]);
  assert.equal(resolveWorkFilter("unexpected"), "all");
});

test("case-study Markdown is split into supported editorial sections", () => {
  const sections = parseProjectCaseStudy("Lead overview.\n\n## Problem\nA real problem.\n\n## What I Learned\nA lesson.");
  assert.deepEqual(sections.map((item) => item.key), ["overview", "problem", "learning"]);
  assert.equal(sections[1].markdown, "A real problem.");
});

test("safe Markdown skips database-controlled HTML and unsafe links", () => {
  const html = renderToStaticMarkup(<SafeMarkdown markdown={'Text <script>alert("x")</script> [unsafe](javascript:alert(1))'} />);
  assert.doesNotMatch(html, /<script/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /Text/);
});

test("project case study combines structured data with safe Markdown sections", () => {
  const base = project([{ key: "ai", name: "AI" }]);
  const html = renderToStaticMarkup(<ProjectCaseStudy project={{ ...base,
    bodyMarkdown: "## Problem\nA supplied problem.\n\n## Architecture\nA supplied architecture.",
    seoTitle: null, seoDescription: null, media: [],
    technologies: [{ key: "typescript", name: "TypeScript" }],
  }} nextProject={null} />);
  assert.match(html, /A supplied problem/);
  assert.match(html, /A supplied architecture/);
  assert.match(html, /TypeScript/);
  assert.match(html, /Explore all work/);
  assert.doesNotMatch(html, /Not specified/);
});

test("research Markdown maps academic headings without dropping custom sections", () => {
  const sections = parseResearchDocument("Lead abstract.\n\n## Research Question\nA question.\n\n## Experimental Setup\nA setup.\n\n## Reproducibility\nNotes.");
  assert.deepEqual(sections.map((item) => item.key), ["abstract", "question", "experimental-setup", "additional"]);
});

test("Thought frontmatter exposes a safe category and derives reading time", () => {
  const document = parseThoughtDocument("---\ncategory: Agentic AI\n---\n" + "word ".repeat(221));
  assert.equal(document.category, "Agentic AI");
  assert.equal(document.readingMinutes, 2);
  assert.doesNotMatch(document.bodyMarkdown, /category:/);
});

test("safe Markdown renders only explicitly supplied MediaAsset references", () => {
  const media: PublicMediaReference = { id: "reference-id", role: "body", alt: "Managed diagram",
    caption: "System pipeline", isDecorative: false,
    image: { id: "asset-id", access: "public", src: "/managed-diagram.png", width: 1200, height: 800, alt: "Managed diagram" } };
  const html = renderToStaticMarkup(<SafeMarkdown markdown="![Ignored](media:reference-id) ![Remote](https://example.test/image.png)"
    media={[media]} measure="article" tone="research" />);
  assert.match(html, /Managed diagram/);
  assert.match(html, /System pipeline/);
  assert.doesNotMatch(html, /example\.test/);
});

test("research detail renders academic sections, tables, and restrained resources", () => {
  const research: PublicResearchDetail = {
    id: "10000000-0000-4000-8000-000000000001", slug: "research-example", title: "Research Example",
    summary: "A supplied abstract.", researchType: "Experiment", researchStage: "Working paper",
    roleOrContribution: "Supplied contribution", researchDate: "2026", academicPublishedDate: null,
    institution: null, venue: null, citationText: null, doi: null, collaborators: [], links: [],
    technologies: [{ key: "model-a", name: "Model A" }], cover: null,
    publishedAt: "2026-01-01T00:00:00.000Z", publicUpdatedAt: "2026-01-01T00:00:00.000Z",
    bodyMarkdown: "## Research Question\nA supplied question.\n\n## Results\n| Metric | Value |\n| --- | --- |\n| Example | 1 |\n\n## Limitations\nA supplied limitation.",
    seoTitle: null, seoDescription: null, media: [],
  };
  const html = renderToStaticMarkup(<ResearchDetail research={research} />);
  assert.match(html, /Research Question/);
  assert.match(html, /<table/);
  assert.match(html, /A supplied limitation/);
  assert.doesNotMatch(html, /dashboard/i);
});

test("Thought article includes progress, reading navigation, and safe references", () => {
  const adjacent = (id: string, slug: string, title: string): PublicThought => ({ id, slug, title,
    excerpt: "Adjacent excerpt", category: null, readingMinutes: 1, cover: null,
    publishedAt: "2025-01-01T00:00:00.000Z", publicUpdatedAt: "2025-01-01T00:00:00.000Z" });
  const thought: PublicThoughtDetail = { ...adjacent("20000000-0000-4000-8000-000000000001", "current", "Current Thought"),
    category: "AI", readingMinutes: 4, bodyMarkdown: "## A section\nArticle body.", seoTitle: null,
    seoDescription: null, references: [{ label: "Safe source", url: "https://example.test/source" },
      { label: "Unsafe source", url: "javascript:alert(1)" }], media: [] };
  const html = renderToStaticMarkup(<ThoughtArticle thought={thought} profile={null}
    previous={adjacent("20000000-0000-4000-8000-000000000002", "older", "Older Thought")}
    next={adjacent("20000000-0000-4000-8000-000000000003", "newer", "Newer Thought")} />);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /PREVIOUS ARTICLE/);
  assert.match(html, /NEXT ARTICLE/);
  assert.match(html, /Back to Thoughts/);
  assert.match(html, /Safe source/);
  assert.doesNotMatch(html, /Unsafe source/);
});
