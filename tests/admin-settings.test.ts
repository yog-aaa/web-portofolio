import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../lib/database/schema";
import type { Database } from "../lib/database/connection";
import { createPublicContentQueries } from "../lib/queries/public-content";
import { AdminSettingsService } from "../lib/services/admin-settings";
import { siteSettingsInputSchema, themeSettingsInputSchema } from "../lib/validation/settings";

async function fixture() {
  const client = new PGlite();
  const directory = resolve(__dirname, "../drizzle");
  for (const file of (await readdir(directory)).filter((value) => value.endsWith(".sql")).sort()) {
    await client.exec(await readFile(resolve(directory, file), "utf8"));
  }
  const db = drizzle(client, { schema }) as unknown as Database;
  const permissions: string[] = [];
  const service = new AdminSettingsService(db, async (permission) => { permissions.push(permission); });
  return { client, db, service, permissions, publicQueries: createPublicContentQueries(db) };
}

function siteInput(expectedUpdatedAt: string | null = null) {
  return siteSettingsInputSchema.parse({ expectedUpdatedAt, profileDisplayName: "Yoga Agustiansyah",
    location: "Indonesia", portraitMediaId: "", brandName: "YOGAAA.", siteTitle: "YOGAAA.",
    defaultSeoDescription: "A personal digital hub.", contentLanguage: "en",
    heroEyebrow: "SOFTWARE · AI · RESEARCH", heroHeadline: "Build useful things.",
    heroDescription: "A calm description.", heroExploreLabel: "Explore work",
    contactHeading: "Start a conversation.", contactLabel: "Contact", contactText: "Share the context.",
    contactEmail: "owner@example.test", footerContent: "Software · AI · Research",
    socialLinks: [{ label: "GitHub", destination: "https://github.com/example", platformKey: "github" }],
    sectionCopy: {
      selectedWork: { heading: "Selected Work", intro: "", actionLabel: "View work" },
      experienceHighlight: { heading: "Experience", intro: "", actionLabel: "View experience" },
      featuredResearch: { heading: "Research", intro: "", actionLabel: "View research" },
      latestThoughts: { heading: "Thoughts", intro: "", actionLabel: "Read thoughts" },
      shortAbout: { heading: "About", intro: "", actionLabel: "About Yoga" },
      contact: { heading: "Contact" },
    } });
}

test("site settings require owner access, persist managed links, and reject stale writes", async (t) => {
  const f = await fixture(); t.after(() => f.client.close());
  const denied = new AdminSettingsService(f.db, async () => { throw new Error("denied"); });
  await assert.rejects(denied.site(), /denied/);
  await assert.rejects(denied.saveSite(siteInput()), /denied/);
  await assert.rejects(denied.theme(), /denied/);
  await assert.rejects(denied.saveTheme(themeSettingsInputSchema.parse({ intent: "reset", expectedUpdatedAt: null })), /denied/);
  assert.equal(await f.service.site(), null);
  await f.service.saveSite(siteInput());
  const saved = await f.service.site();
  assert.equal(saved?.brandName, "YOGAAA.");
  assert.equal(saved?.contactEmail, "owner@example.test");
  assert.equal(saved?.socialLinks[0].destination, "https://github.com/example");
  assert.equal(saved?.socialLinks[0].platformKey, "github");
  assert.equal((await f.publicQueries.getProfile())?.socialLinks.length, 2);
  assert.equal((await f.publicQueries.getSiteSettings())?.heroHeadline, "Build useful things.");
  await assert.rejects(f.service.saveSite(siteInput(null)), /SETTINGS_STALE/);
  assert.ok(f.permissions.includes("cms:read"));
  assert.ok(f.permissions.includes("cms:write"));
});

test("theme settings validate contrast, reach public queries, and reset to defaults", async (t) => {
  const f = await fixture(); t.after(() => f.client.close());
  const invalid = themeSettingsInputSchema.safeParse({ intent: "save", expectedUpdatedAt: null,
    background: "#FFFFFF", surface: "#FFFFFF", foreground: "#EEEEEE", border: "#D9E2EC",
    accent: "#FFFFFF", accentSecondary: "#6E8CA6", accentForeground: "#FFFFFF", accentSoft: "#DDEAF3" });
  assert.equal(invalid.success, false);
  const input = themeSettingsInputSchema.parse({ intent: "save", expectedUpdatedAt: null,
    background: "#F7F9FC", surface: "#FFFFFF", foreground: "#172033", border: "#D9E2EC",
    accent: "#27374D", accentSecondary: "#6E8CA6", accentForeground: "#FFFFFF", accentSoft: "#DDEAF3" });
  await f.service.saveTheme(input);
  assert.equal((await f.publicQueries.getThemeSettings())?.accent, "#27374D");
  const current = await f.service.theme();
  await f.service.saveTheme(themeSettingsInputSchema.parse({ intent: "reset", expectedUpdatedAt: current!.updatedAt }));
  assert.equal((await f.publicQueries.getThemeSettings())?.accent, null);
});
