import "server-only";

import { eq, sql } from "drizzle-orm";
import type { Database } from "../../lib/database/connection";
import { education, profile, siteSettings, themeSettings } from "../../lib/database/schema/site";
import { research, researchSlugs } from "../../lib/database/schema/editorial";

export const developmentSeedIds = {
  education: "ef93fa1f-43a2-451f-8878-7bc6871ca101",
  research: "ef93fa1f-43a2-451f-8878-7bc6871ca102",
} as const;

const researchTitle = "Privacy-Preserving Fall Detection";
const researchSlug = "privacy-preserving-fall-detection";
const researchSummary = "A privacy-preserving fall monitoring research project comparing RGB and skeleton-based human representations and examining the performance/privacy trade-off with lightweight object detection approaches such as RF-DETR Nano and YOLO.";

export type DevelopmentSeedResult = { profile: "created" | "preserved"; education: "created" | "preserved";
  research: "created" | "preserved" };

/** Non-destructive and idempotent. Caller owns environment/target confirmation. */
export async function seedDevelopmentContent(db: Database): Promise<DevelopmentSeedResult> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(9642026, 1)`);
    const [profileRow] = await tx.insert(profile).values({
      id: 1,
      displayName: "Yoga Agustiansyah",
      focusLine: "Software Development · Artificial Intelligence · Computer Vision · Research · Product Development · Agentic AI",
      location: "Indonesia",
    }).onConflictDoNothing().returning({ id: profile.id });
    await tx.insert(themeSettings).values({ id: 1 }).onConflictDoNothing();
    await tx.insert(siteSettings).values({ id: 1, profileId: 1, themeSettingsId: 1,
      brandName: "YOGAAA.", siteTitle: "YOGAAA.",
      heroSupportingCopy: "SOFTWARE · AI · RESEARCH",
      heroHeadline: "Building useful digital products with software & AI.",
      heroIntro: "Exploring software, artificial intelligence, computer vision, research, product development, and agentic AI.",
      heroExploreLabel: "Explore selected work",
      contactCtaHeading: "Have a project or research idea worth exploring?",
      contactCtaLabel: "Get in touch",
      contactSupportingCopy: "Start with the context, the problem, and what you hope to build.",
      footerCopy: "Software · AI · Research",
      sectionCopy: {
        selectedWork: { heading: "Selected Work", intro: "A focused view of projects and research shaped by practical questions.", actionLabel: "View all work" },
        experienceHighlight: { heading: "Experience", actionLabel: "View experience" },
        featuredResearch: { heading: "Featured Research", actionLabel: "View all research" },
        latestThoughts: { heading: "Latest Thoughts", actionLabel: "Read all thoughts" },
        shortAbout: { heading: "About", actionLabel: "More about Yoga" },
        contact: { heading: "Contact" },
      },
    }).onConflictDoNothing();

    const [educationRow] = await tx.insert(education).values({
      id: developmentSeedIds.education,
      profileId: 1,
      institutionName: "Institut Teknologi Garut",
      qualificationOrProgram: "S1 Teknik Informatika",
      startDate: "2022",
      endDate: "2026",
      isVisible: true,
      sortOrder: 0,
    }).onConflictDoNothing().returning({ id: education.id });

    const [existingSlug] = await tx.select({ id: researchSlugs.researchId }).from(researchSlugs)
      .where(eq(researchSlugs.slug, researchSlug));
    const [researchRow] = existingSlug ? [] : await tx.insert(research).values({
      id: developmentSeedIds.research,
      profileId: 1,
      title: researchTitle,
      summary: researchSummary,
      bodyMarkdown: researchSummary,
      researchType: "Research project",
      status: "draft",
      isFeatured: true,
      featuredOrder: 0,
      sortOrder: 0,
      draftContent: {
        version: 1,
        title: researchTitle,
        slug: researchSlug,
        summary: researchSummary,
        bodyMarkdown: researchSummary,
        researchType: "Research project",
        isFeatured: true,
        featuredOrder: 0,
        sortOrder: 0,
      },
    }).onConflictDoNothing().returning({ id: research.id });
    if (researchRow) {
      await tx.insert(researchSlugs).values({ slug: researchSlug, researchId: researchRow.id });
      await tx.update(research).set({ slug: researchSlug }).where(eq(research.id, researchRow.id));
    }
    return { profile: profileRow ? "created" : "preserved",
      education: educationRow ? "created" : "preserved", research: researchRow ? "created" : "preserved" };
  });
}
