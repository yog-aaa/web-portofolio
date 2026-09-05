import "server-only";

import { eq, sql } from "drizzle-orm";
import type { Database } from "../../lib/database/connection";
import { defaultEducationSectionCopy } from "../../lib/domain/content-values";
import { projects, projectSlugs, research, researchSlugs, thoughts, thoughtSlugs } from "../../lib/database/schema/editorial";
import { experiences, projectCategories, projectCategoryAssignments, projectTechnologies,
  researchTechnologies, technologies } from "../../lib/database/schema/relationships";
import { credentials, education, profile, sitePageSettings, siteSettings, socialLinks,
  themeSettings } from "../../lib/database/schema/site";

export const developmentSeedIds = {
  education: "ef93fa1f-43a2-451f-8878-7bc6871ca101",
  research: "ef93fa1f-43a2-451f-8878-7bc6871ca102",
  project: "ef93fa1f-43a2-451f-8878-7bc6871ca103",
  thought: "ef93fa1f-43a2-451f-8878-7bc6871ca104",
  experiencePlaceholder: "ef93fa1f-43a2-451f-8878-7bc6871ca105",
  credentialPlaceholder: "ef93fa1f-43a2-451f-8878-7bc6871ca106",
  socialPlaceholder: "ef93fa1f-43a2-451f-8878-7bc6871ca107",
  categories: {
    software: "ef93fa1f-43a2-451f-8878-7bc6871ca201",
    ai: "ef93fa1f-43a2-451f-8878-7bc6871ca202",
    research: "ef93fa1f-43a2-451f-8878-7bc6871ca203",
    experiments: "ef93fa1f-43a2-451f-8878-7bc6871ca204",
  },
  technologies: {
    nextjs: "ef93fa1f-43a2-451f-8878-7bc6871ca301",
    react: "ef93fa1f-43a2-451f-8878-7bc6871ca302",
    typescript: "ef93fa1f-43a2-451f-8878-7bc6871ca303",
    tailwind: "ef93fa1f-43a2-451f-8878-7bc6871ca304",
    postgresql: "ef93fa1f-43a2-451f-8878-7bc6871ca305",
    drizzle: "ef93fa1f-43a2-451f-8878-7bc6871ca306",
    betterAuth: "ef93fa1f-43a2-451f-8878-7bc6871ca307",
    cloudinary: "ef93fa1f-43a2-451f-8878-7bc6871ca308",
    rfDetrNano: "ef93fa1f-43a2-451f-8878-7bc6871ca309",
    yolo: "ef93fa1f-43a2-451f-8878-7bc6871ca310",
  },
} as const;

const researchTitle = "Privacy-Preserving Fall Detection";
const researchSlug = "privacy-preserving-fall-detection";
const researchSummary = "A privacy-preserving fall monitoring research project comparing RGB and skeleton-based human representations and examining the performance/privacy trade-off with lightweight object detection approaches such as RF-DETR Nano and YOLO.";
const placeholderWarning = "Replace this placeholder with verified personal information before making it public.";

type SeedState = "created" | "preserved";
export type DevelopmentSeedResult = {
  profile: SeedState; education: SeedState; project: SeedState; research: SeedState; thought: SeedState;
  experience: SeedState; credential: SeedState; socialLink: SeedState;
  categoriesCreated: number; technologiesCreated: number; pageSettingsCreated: number;
};

/** Non-destructive and idempotent. Caller owns environment/target confirmation. */
export async function seedDevelopmentContent(db: Database): Promise<DevelopmentSeedResult> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(9642026, 1)`);
    const [profileRow] = await tx.insert(profile).values({ id: 1, displayName: "Yoga Agustiansyah",
      focusLine: "Software Development · Artificial Intelligence · Computer Vision · Research · Product Development · Agentic AI",
      shortBiography: "Based in Indonesia and exploring software, artificial intelligence, computer vision, research, product development, and agentic AI.",
      location: "Indonesia" }).onConflictDoNothing().returning({ id: profile.id });
    await tx.insert(themeSettings).values({ id: 1, background: "#F7F9FC", surface: "#FFFFFF",
      foreground: "#172033", border: "#D9E2EC", accent: "#526D82", accentForeground: "#FFFFFF",
      accentSoft: "#DDEAF3", accentSecondary: "#6E8CA6" }).onConflictDoNothing();
    await tx.insert(siteSettings).values({ id: 1, profileId: 1, themeSettingsId: 1, brandName: "YOGAAA.",
      siteTitle: "Yoga Agustiansyah — Software, AI & Research",
      defaultSeoDescription: "The personal website of Yoga Agustiansyah, focused on software, artificial intelligence, computer vision, research, and product development.",
      contentLanguage: "en", heroSupportingCopy: "SOFTWARE · AI · RESEARCH",
      heroHeadline: "Building useful digital products with software & AI.",
      heroIntro: "Exploring software, artificial intelligence, computer vision, research, product development, and agentic AI.",
      heroExploreLabel: "Explore selected work", contactCtaHeading: "Have a project or research idea worth exploring?",
      contactCtaLabel: "Get in touch", contactSupportingCopy: "Start with the context, the problem, and what you hope to build.",
      footerCopy: "Software · AI · Research", sectionCopy: {
        selectedWork: { heading: "Selected Work", intro: "A focused view of projects and research shaped by practical questions.", actionLabel: "View all work" },
        experienceHighlight: { heading: "Experience", actionLabel: "View experience" },
        education: defaultEducationSectionCopy,
        featuredResearch: { heading: "Featured Research", actionLabel: "View all research" },
        latestThoughts: { heading: "Latest Thoughts", actionLabel: "Read all thoughts" },
        shortAbout: { heading: "About", actionLabel: "More about Yoga" }, contact: { heading: "Contact" },
      } }).onConflictDoNothing();

    const pageRows = await tx.insert(sitePageSettings).values([
      { route: "/", siteSettingsId: 1, intro: "Selected work, research, writing, and background in one place.", seoTitle: "Yoga Agustiansyah — Software, AI & Research" },
      { route: "/work", siteSettingsId: 1, intro: "Selected software, AI, research, and technology experiments.", emptyStateCopy: "Published work will appear here." },
      { route: "/experience", siteSettingsId: 1, intro: "A chronological view of professional, organizational, community, and project experience.", emptyStateCopy: "Verified experience will appear here." },
      { route: "/research", siteSettingsId: 1, intro: "Research questions, methods, experiments, and findings.", emptyStateCopy: "Published research will appear here." },
      { route: "/thoughts", siteSettingsId: 1, intro: "Notes and longer writing about software, AI, research, and building technology.", emptyStateCopy: "Published Thoughts will appear here." },
      { route: "/about", siteSettingsId: 1, intro: "Background, education, interests, and the work currently being explored." },
      { route: "/credentials", siteSettingsId: 1, intro: "Verifiable learning and professional credentials.", emptyStateCopy: "Verified credentials will appear here." },
    ]).onConflictDoNothing().returning({ route: sitePageSettings.route });

    const [educationRow] = await tx.insert(education).values({ id: developmentSeedIds.education, profileId: 1,
      institutionName: "Institut Teknologi Garut", qualificationOrProgram: "S1 Teknik Informatika",
      startDate: "2022", endDate: "2026", isVisible: true, sortOrder: 0,
    }).onConflictDoNothing().returning({ id: education.id });

    const categoryRows = await tx.insert(projectCategories).values([
      { id: developmentSeedIds.categories.software, name: "Software", key: "software", description: "Software products, applications, and engineering work.", sortOrder: 0 },
      { id: developmentSeedIds.categories.ai, name: "AI", key: "ai", description: "Artificial intelligence and machine learning work.", sortOrder: 1 },
      { id: developmentSeedIds.categories.research, name: "Research", key: "research", description: "Research-led projects and experiments.", sortOrder: 2 },
      { id: developmentSeedIds.categories.experiments, name: "Experiments", key: "experiments", description: "Focused technical and product experiments.", sortOrder: 3 },
    ]).onConflictDoNothing().returning({ id: projectCategories.id });
    const technologyRows = await tx.insert(technologies).values([
      { id: developmentSeedIds.technologies.nextjs, name: "Next.js", key: "nextjs", referenceUrl: "https://nextjs.org", iconKey: "nextjs", sortOrder: 0 },
      { id: developmentSeedIds.technologies.react, name: "React", key: "react", referenceUrl: "https://react.dev", iconKey: "react", sortOrder: 1 },
      { id: developmentSeedIds.technologies.typescript, name: "TypeScript", key: "typescript", referenceUrl: "https://www.typescriptlang.org", iconKey: "typescript", sortOrder: 2 },
      { id: developmentSeedIds.technologies.tailwind, name: "Tailwind CSS", key: "tailwind-css", referenceUrl: "https://tailwindcss.com", iconKey: "tailwind-css", sortOrder: 3 },
      { id: developmentSeedIds.technologies.postgresql, name: "PostgreSQL", key: "postgresql", referenceUrl: "https://www.postgresql.org", iconKey: "postgresql", sortOrder: 4 },
      { id: developmentSeedIds.technologies.drizzle, name: "Drizzle ORM", key: "drizzle-orm", referenceUrl: "https://orm.drizzle.team", iconKey: "drizzle-orm", sortOrder: 5 },
      { id: developmentSeedIds.technologies.betterAuth, name: "Better Auth", key: "better-auth", referenceUrl: "https://www.better-auth.com", iconKey: "better-auth", sortOrder: 6 },
      { id: developmentSeedIds.technologies.cloudinary, name: "Cloudinary", key: "cloudinary", referenceUrl: "https://cloudinary.com", iconKey: "cloudinary", sortOrder: 7 },
      { id: developmentSeedIds.technologies.rfDetrNano, name: "RF-DETR Nano", key: "rf-detr-nano", iconKey: "rf-detr", sortOrder: 8 },
      { id: developmentSeedIds.technologies.yolo, name: "YOLO", key: "yolo", iconKey: "yolo", sortOrder: 9 },
    ]).onConflictDoNothing().returning({ id: technologies.id });

    const categoryByKey = new Map((await tx.select({ id: projectCategories.id, key: projectCategories.key }).from(projectCategories)).map((row) => [row.key, row.id]));
    const technologyByKey = new Map((await tx.select({ id: technologies.id, key: technologies.key }).from(technologies)).map((row) => [row.key, row.id]));

    const projectDraft = { version: 1 as const, title: researchTitle, slug: researchSlug, summary: researchSummary,
      roleOrContribution: "Replace with a verified role or contribution before publishing.",
      bodyMarkdown: `## Overview\n\n${researchSummary}\n\n## Status\n\n${placeholderWarning}`,
      isFeatured: true, featuredOrder: 0, sortOrder: 0 };
    let [projectOwner] = await tx.select({ id: projectSlugs.projectId }).from(projectSlugs).where(eq(projectSlugs.slug, researchSlug));
    const [projectRow] = projectOwner ? [] : await tx.insert(projects).values({ id: developmentSeedIds.project,
      title: researchTitle, status: "draft", draftContent: projectDraft, isFeatured: false, sortOrder: 0,
    }).onConflictDoNothing().returning({ id: projects.id });
    if (projectRow) { await tx.insert(projectSlugs).values({ slug: researchSlug, projectId: projectRow.id }); projectOwner = projectRow; }

    const researchDraft = { version: 1 as const, title: researchTitle, slug: researchSlug, summary: researchSummary,
      bodyMarkdown: `## Abstract\n\n${researchSummary}\n\n## Research Question\n\n${placeholderWarning}\n\n## Methodology\n\n${placeholderWarning}\n\n## Results\n\n${placeholderWarning}`,
      researchType: "Research project", researchStage: "In progress",
      roleOrContribution: "Replace with a verified role or contribution before publishing.",
      isFeatured: true, featuredOrder: 0, sortOrder: 0 };
    let [researchOwner] = await tx.select({ id: researchSlugs.researchId }).from(researchSlugs).where(eq(researchSlugs.slug, researchSlug));
    const [researchRow] = researchOwner ? [] : await tx.insert(research).values({ id: developmentSeedIds.research,
      profileId: 1, title: researchTitle, status: "draft", draftContent: researchDraft, isFeatured: false, sortOrder: 0,
    }).onConflictDoNothing().returning({ id: research.id });
    if (researchRow) { await tx.insert(researchSlugs).values({ slug: researchSlug, researchId: researchRow.id }); researchOwner = researchRow; }

    const thoughtDraft = { version: 1 as const, title: "[Placeholder] First Thought", slug: "placeholder-first-thought",
      excerpt: placeholderWarning, bodyMarkdown: `---\ncategory: Technology\n---\n\n## Replace this draft\n\n${placeholderWarning}` };
    const [thoughtOwner] = await tx.select({ id: thoughtSlugs.thoughtId }).from(thoughtSlugs).where(eq(thoughtSlugs.slug, thoughtDraft.slug));
    const [thoughtRow] = thoughtOwner ? [] : await tx.insert(thoughts).values({ id: developmentSeedIds.thought,
      title: thoughtDraft.title, status: "draft", draftContent: thoughtDraft,
    }).onConflictDoNothing().returning({ id: thoughts.id });
    if (thoughtRow) await tx.insert(thoughtSlugs).values({ slug: thoughtDraft.slug, thoughtId: thoughtRow.id });

    const [experienceRow] = await tx.insert(experiences).values({ id: developmentSeedIds.experiencePlaceholder,
      profileId: 1, roleTitle: "[Placeholder] Role or title", organizationName: "[Placeholder] Organization",
      description: placeholderWarning, startDate: "2026", contextLabel: "Professional", isVisible: false,
      isFeatured: false, sortOrder: 100 }).onConflictDoNothing().returning({ id: experiences.id });
    const [credentialRow] = await tx.insert(credentials).values({ id: developmentSeedIds.credentialPlaceholder,
      profileId: 1, title: "[Placeholder] Credential name", issuerName: "[Placeholder] Issuer",
      credentialType: "Other", description: placeholderWarning, isVisible: false, sortOrder: 100,
    }).onConflictDoNothing().returning({ id: credentials.id });
    const [socialRow] = await tx.insert(socialLinks).values({ id: developmentSeedIds.socialPlaceholder,
      profileId: 1, label: "[Placeholder] Social profile", destination: "https://example.com/replace-me",
      purpose: "social", platformKey: "link", isVisible: false, sortOrder: 100,
    }).onConflictDoNothing().returning({ id: socialLinks.id });

    if (projectOwner) {
      const categoryIds = [categoryByKey.get("software"), categoryByKey.get("ai"), categoryByKey.get("research")].filter((id): id is string => Boolean(id));
      if (categoryIds.length) await tx.insert(projectCategoryAssignments).values(categoryIds.map((categoryId) => ({
        projectId: projectOwner.id, categoryId, slot: "draft" as const }))).onConflictDoNothing();
      const technologyIds = [technologyByKey.get("rf-detr-nano"), technologyByKey.get("yolo")].filter((id): id is string => Boolean(id));
      if (technologyIds.length) await tx.insert(projectTechnologies).values(technologyIds.map((technologyId) => ({
        projectId: projectOwner.id, technologyId, slot: "draft" as const }))).onConflictDoNothing();
    }
    if (researchOwner) {
      const technologyIds = [technologyByKey.get("rf-detr-nano"), technologyByKey.get("yolo")].filter((id): id is string => Boolean(id));
      if (technologyIds.length) await tx.insert(researchTechnologies).values(technologyIds.map((technologyId) => ({
        researchId: researchOwner.id, technologyId, slot: "draft" as const }))).onConflictDoNothing();
    }

    return { profile: profileRow ? "created" : "preserved", education: educationRow ? "created" : "preserved",
      project: projectRow ? "created" : "preserved", research: researchRow ? "created" : "preserved",
      thought: thoughtRow ? "created" : "preserved", experience: experienceRow ? "created" : "preserved",
      credential: credentialRow ? "created" : "preserved", socialLink: socialRow ? "created" : "preserved",
      categoriesCreated: categoryRows.length, technologiesCreated: technologyRows.length, pageSettingsCreated: pageRows.length };
  });
}
