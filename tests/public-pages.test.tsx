import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SafeMarkdown } from "../components/content/safe-markdown";
import { ProjectCaseStudy } from "../components/work/project-case-study";
import { filterProjects, resolveWorkFilter } from "../components/work/work-archive";
import { parseProjectCaseStudy } from "../lib/presentation/project-case-study";
import type { PublicProject } from "../lib/domain/content";

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
