import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "../components/seo/json-ld";
import { SafeMarkdown } from "../components/content/safe-markdown";
import { detailMetadata, homeMetadata } from "../lib/presentation/metadata";
import { absoluteSiteUrl, parseSiteUrl } from "../lib/presentation/site-url";
import robots from "../app/robots";
import nextConfig from "../next.config";

test("production metadata uses stable canonical and social URLs", () => {
  const home = homeMetadata(null, null);
  assert.deepEqual(home.title, { absolute: "Yoga Agustiansyah — Software, AI & Research" });
  assert.equal(home.alternates?.canonical, absoluteSiteUrl("/"));

  const detail = detailMetadata({ title: "Published work — YOGAAA.", description: "A supplied summary.",
    canonicalPath: "/work/supplied-work", publishedAt: "2026-01-01T00:00:00.000Z",
    modifiedAt: "2026-02-01T00:00:00.000Z" });
  assert.equal(detail.alternates?.canonical, absoluteSiteUrl("/work/supplied-work"));
  assert.equal((detail.openGraph as { type?: string })?.type, "article");
  assert.equal((detail.twitter as { card?: string })?.card, "summary");
});

test("site URL environment accepts only an origin and is required on Vercel production", () => {
  assert.equal(parseSiteUrl("http://localhost:3000", "development").origin, "http://localhost:3000");
  assert.equal(parseSiteUrl("https://yogaagustiansyah.my.id", "production").origin, "https://yogaagustiansyah.my.id");
  assert.throws(() => parseSiteUrl("https://user:secret@example.com/path", "production"), /NEXT_PUBLIC_SITE_URL/);
  assert.throws(() => parseSiteUrl(undefined, "production"), /NEXT_PUBLIC_SITE_URL/);
});

test("robots permits public discovery while excluding private and API routes", () => {
  const value = robots();
  assert.deepEqual(value.rules, { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] });
  assert.equal(value.sitemap, absoluteSiteUrl("/sitemap.xml"));
});

test("production responses disable framework disclosure and carry baseline security headers", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  const entries = await nextConfig.headers?.();
  const global = entries?.find((entry) => entry.source === "/(.*)");
  const names = new Set(global?.headers.map((header) => header.key));
  for (const name of ["Content-Security-Policy", "Referrer-Policy", "Permissions-Policy",
    "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options"]) {
    assert.equal(names.has(name), true, `${name} is missing`);
  }
});

test("JSON-LD serialization cannot be closed by managed content", () => {
  const html = renderToStaticMarkup(<JsonLd data={{ "@context": "https://schema.org",
    name: "</script><script>alert(1)</script>" }} />);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /\\u003c\/script\\u003e/);
});

test("wide Markdown tables expose a keyboard-scrollable region", () => {
  const html = renderToStaticMarkup(<SafeMarkdown markdown={"| Metric | Value |\n| --- | --- |\n| Accuracy | supplied |"} />);
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Scrollable data table"/);
  assert.match(html, /tabindex="0"/);
});
