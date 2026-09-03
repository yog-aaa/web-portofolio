import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage } from "../components/home/home-page";
import type { PublicResearch, PublicSiteSettings } from "../lib/domain/content";

const settings: PublicSiteSettings = {
  brandName: "Test Brand", siteTitle: "Test Site", defaultSeoDescription: null,
  contentLanguage: "en", heroHeadline: "Database hero headline",
  heroIntro: "Database hero introduction.", heroExploreLabel: "Explore the work",
  heroSupportingCopy: "SOFTWARE · AI · RESEARCH", contactCtaHeading: null,
  contactCtaLabel: null, contactSupportingCopy: null, footerCopy: null,
  sectionCopy: {
    selectedWork: { heading: "Database selected work", intro: "Database section introduction." },
    featuredResearch: { heading: "Database featured research" },
  },
  defaultSocialImage: null,
};
const fallDetection: PublicResearch = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "privacy-preserving-fall-detection",
  title: "Privacy-Preserving Fall Detection",
  summary: "A supplied research summary.", researchType: "Research project",
  researchStage: null, roleOrContribution: "Supplied role", researchDate: null,
  academicPublishedDate: null, institution: null, venue: null, citationText: null,
  doi: null, collaborators: [], links: [], publishedAt: "2026-01-01T00:00:00.000Z",
  publicUpdatedAt: "2026-01-01T00:00:00.000Z", technologies: [], cover: null,
};

test("homepage uses query-layer copy and promotes featured research into selected work", () => {
  const html = renderToStaticMarkup(<HomePage settings={settings} profile={null}
    projects={[]} experience={null} research={[fallDetection]} thoughts={[]} />);
  assert.match(html, /Database hero headline/);
  assert.match(html, /Database hero introduction/);
  assert.match(html, /Database selected work/);
  assert.match(html, /Privacy-Preserving Fall Detection/);
  assert.match(html, /href="\/research\/privacy-preserving-fall-detection"/);
  assert.doesNotMatch(html, /Hi, I/);
  assert.doesNotMatch(html, /Hello World/);
});
