import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage } from "../components/home/home-page";
import type { PublicProfile, PublicResearch, PublicSiteSettings } from "../lib/domain/content";

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

test("homepage preserves portrait dimensions and renders primary and secondary actions", () => {
  const profile: PublicProfile = {
    displayName: "Yoga Agustiansyah", focusLine: null, shortBiography: null,
    biographyMarkdown: null, location: null, availabilityText: null, resumeUrl: null,
    portrait: { id: "portrait", access: "public", src: "/portrait.jpg", width: 900, height: 1200, alt: "Owner portrait" },
    education: [], socialLinks: [{ id: "email", label: "Email", destination: "mailto:owner@example.test",
      purpose: "contact", platformKey: "email" }],
  };
  const html = renderToStaticMarkup(<HomePage settings={{ ...settings, contactCtaLabel: "Start a conversation" }}
    profile={profile} projects={[]} experience={null} research={[]} thoughts={[]} />);
  assert.match(html, /width="900"/);
  assert.match(html, /height="1200"/);
  assert.match(html, /href="\/work"/);
  assert.match(html, /href="mailto:owner@example.test"/);
  assert.match(html, /Start a conversation/);
});
