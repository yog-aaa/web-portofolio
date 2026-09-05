import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage } from "../components/home/home-page";
import { AboutPage } from "../components/about/about-page";
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

const educationProfile: PublicProfile = {
  displayName: "Test Owner", focusLine: null, shortBiography: null, biographyMarkdown: null,
  location: null, availabilityText: null, resumeUrl: null, portrait: null, socialLinks: [],
  education: [{ id: "education-1", institutionName: "Example Institute", qualificationOrProgram: "Example program",
    fieldOfStudy: "Computing", startDate: "2022-09", endDate: null, isCurrent: true,
    description: "Owner-supplied study description.", institutionUrl: "https://example.test",
    gpaValue: "3.500", gpaScale: "4.000", institutionImage: null }],
};

test("homepage places CMS education after experience and links to the About education section", () => {
  const html = renderToStaticMarkup(<HomePage settings={{ ...settings, sectionCopy: { ...settings.sectionCopy,
    experienceHighlight: { heading: "Experience" }, education: { heading: "Academic background", intro: "Studies and learning.", actionLabel: "All education" },
  } }} profile={educationProfile} projects={[]} research={[fallDetection, { ...fallDetection, id: "second", slug: "second" }]} thoughts={[]}
    experience={{ id: "experience", roleTitle: "Example role", organizationName: "Example organization",
      contextLabel: null, startDate: "2024", endDate: null, isCurrent: true, location: null,
      description: "Example experience", organizationUrl: null, organizationImage: null }} />);
  assert.ok(html.indexOf('id="experience-title"') < html.indexOf('id="education-title"'));
  assert.ok(html.indexOf('id="education-title"') < html.indexOf('id="research-title"'));
  for (const text of ["Academic background", "Studies and learning.", "All education", "Example Institute", "Example program",
    "Computing", "Sep 2022 — Present", "GPA 3.5 / 4", "Owner-supplied study description."]) assert.ok(html.includes(text));
  assert.match(html, /href="\/about#education"/);
  const about = renderToStaticMarkup(<AboutPage profile={educationProfile} projects={[]} credentials={[]} pageSettings={null} />);
  assert.match(about, /id="education"/);
});

test("homepage education supports existing settings, respects ordering and limit, and omits missing optional data", () => {
  const profile = { ...educationProfile, education: Array.from({ length: 4 }, (_, i) => ({
    ...educationProfile.education[0], id: `education-${i}`, institutionName: `Institute ${i}`,
    gpaScale: null, startDate: null, isCurrent: false, description: null, institutionUrl: null,
  })) };
  const html = renderToStaticMarkup(<HomePage settings={settings} profile={profile} projects={[]} experience={null} research={[]} thoughts={[]} />);
  assert.match(html, /id="education-title"[^>]*>Education/);
  assert.ok(html.indexOf("Institute 0") < html.indexOf("Institute 1"));
  assert.match(html, /Institute 2/);
  assert.doesNotMatch(html, /Institute 3|GPA|Present|href="https:\/\/example.test"/);
});

test("homepage omits education when no public entries exist or the owner clears its heading", () => {
  for (const profile of [null, { ...educationProfile, education: [] }]) {
    const html = renderToStaticMarkup(<HomePage settings={settings} profile={profile} projects={[]} experience={null} research={[]} thoughts={[]} />);
    assert.doesNotMatch(html, /id="education"/);
  }
  const html = renderToStaticMarkup(<HomePage settings={{ ...settings, sectionCopy: { education: {} } }}
    profile={educationProfile} projects={[]} experience={null} research={[]} thoughts={[]} />);
  assert.doesNotMatch(html, /id="education"|Example Institute/);
});

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
