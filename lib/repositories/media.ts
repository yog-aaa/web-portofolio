import "server-only";

import { and, desc, eq, ne, sql, type AnyColumn } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Database } from "../database/connection";
import { mediaAssets, mediaDeletions } from "../database/schema/media";
import { profile, education, credentials, siteSettings, sitePageSettings } from "../database/schema/site";
import { experiences, projectMedia, researchMedia, thoughtMedia } from "../database/schema/relationships";
import { projects, research, thoughts } from "../database/schema/editorial";
import type { MediaReference } from "../domain/media";
import { MediaError } from "../services/media/errors";

export type MediaRecord = typeof mediaAssets.$inferSelect;
export type MediaDeletion = typeof mediaDeletions.$inferSelect;
export type VerifiedMedia = Pick<MediaRecord, "secureUrl" | "url" | "mimeType" | "format" | "width" | "height" | "bytes">;

const referenceList = (counts: Record<string, unknown>): MediaReference[] => Object.entries(counts)
  .map(([source, count]) => ({ source, count: Number(count) })).filter((item) => item.count > 0);

export async function mediaReferences(db: Database, asset: MediaRecord): Promise<MediaReference[]> {
  const needles = [asset.id, asset.providerId, asset.url, asset.secureUrl].filter((value): value is string => Boolean(value));
  const mentions = (column: AnyColumn) => sql.join(needles.map((value) => sql`strpos(coalesce(${column}::text, ''), ${value}) > 0`), sql` or `);
  const [counts] = await db.select({
    profile: sql<number>`(select count(*) from ${profile} where ${profile.portraitMediaId} = ${asset.id} or (${mentions(profile.biographyMarkdown)}))`,
    siteSettings: sql<number>`(select count(*) from ${siteSettings} where ${siteSettings.defaultSocialImageId} = ${asset.id})`,
    pageSettings: sql<number>`(select count(*) from ${sitePageSettings} where ${sitePageSettings.socialImageId} = ${asset.id})`,
    education: sql<number>`(select count(*) from ${education} where ${education.institutionMediaId} = ${asset.id})`,
    credentials: sql<number>`(select count(*) from ${credentials} where ${credentials.previewMediaId} = ${asset.id})`,
    experience: sql<number>`(select count(*) from ${experiences} where ${experiences.organizationMediaId} = ${asset.id})`,
    projectMedia: sql<number>`(select count(*) from ${projectMedia} where ${projectMedia.mediaAssetId} = ${asset.id})`,
    researchMedia: sql<number>`(select count(*) from ${researchMedia} where ${researchMedia.mediaAssetId} = ${asset.id})`,
    thoughtMedia: sql<number>`(select count(*) from ${thoughtMedia} where ${thoughtMedia.mediaAssetId} = ${asset.id})`,
    projectMarkdown: sql<number>`(select count(*) from ${projects} where (${mentions(projects.bodyMarkdown)}) or (${mentions(projects.draftContent)}))`,
    researchMarkdown: sql<number>`(select count(*) from ${research} where (${mentions(research.bodyMarkdown)}) or (${mentions(research.draftContent)}))`,
    thoughtMarkdown: sql<number>`(select count(*) from ${thoughts} where (${mentions(thoughts.bodyMarkdown)}) or (${mentions(thoughts.draftContent)}))`,
  }).from(mediaAssets).where(eq(mediaAssets.id, asset.id));
  return referenceList(counts ?? {});
}

async function allMediaReferences(db: Database) {
  const assets = alias(mediaAssets, "reference_assets");
  // Drizzle intentionally drops table qualification for correlated equality
  // expressions; keep the outer alias explicit so inner tables with `id` do not capture it.
  const outerId = sql.raw('"reference_assets"."id"');
  const mentions = (column: AnyColumn) => sql`(
    strpos(coalesce(${column}::text, ''), ${assets.id}::text) > 0
    or (${assets.providerId} is not null and strpos(coalesce(${column}::text, ''), ${assets.providerId}) > 0)
    or (${assets.url} is not null and strpos(coalesce(${column}::text, ''), ${assets.url}) > 0)
    or (${assets.secureUrl} is not null and strpos(coalesce(${column}::text, ''), ${assets.secureUrl}) > 0)
  )`;
  const rows = await db.select({
    assetId: assets.id,
    profile: sql<number>`(select count(*) from ${profile} where ${profile.portraitMediaId} = ${outerId} or (${mentions(profile.biographyMarkdown)}))`,
    siteSettings: sql<number>`(select count(*) from ${siteSettings} where ${siteSettings.defaultSocialImageId} = ${outerId})`,
    pageSettings: sql<number>`(select count(*) from ${sitePageSettings} where ${sitePageSettings.socialImageId} = ${outerId})`,
    education: sql<number>`(select count(*) from ${education} where ${education.institutionMediaId} = ${outerId})`,
    credentials: sql<number>`(select count(*) from ${credentials} where ${credentials.previewMediaId} = ${outerId})`,
    experience: sql<number>`(select count(*) from ${experiences} where ${experiences.organizationMediaId} = ${outerId})`,
    projectMedia: sql<number>`(select count(*) from ${projectMedia} where ${projectMedia.mediaAssetId} = ${outerId})`,
    researchMedia: sql<number>`(select count(*) from ${researchMedia} where ${researchMedia.mediaAssetId} = ${outerId})`,
    thoughtMedia: sql<number>`(select count(*) from ${thoughtMedia} where ${thoughtMedia.mediaAssetId} = ${outerId})`,
    projectMarkdown: sql<number>`(select count(*) from ${projects} where (${mentions(projects.bodyMarkdown)}) or (${mentions(projects.draftContent)}))`,
    researchMarkdown: sql<number>`(select count(*) from ${research} where (${mentions(research.bodyMarkdown)}) or (${mentions(research.draftContent)}))`,
    thoughtMarkdown: sql<number>`(select count(*) from ${thoughts} where (${mentions(thoughts.bodyMarkdown)}) or (${mentions(thoughts.draftContent)}))`,
  }).from(assets);
  return new Map(rows.map(({ assetId, ...counts }) => [assetId, referenceList(counts)]));
}

export class MediaRepository {
  constructor(private readonly db: Database) {}

  async find(id: string) {
    const [row] = await this.db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return row ?? null;
  }
  list() {
    return this.db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id));
  }
  referencesForAll() { return allMediaReferences(this.db); }
  async updateMetadata(id: string, value: { altText: string | null; caption: string | null;
    isDecorative: boolean; expectedUpdatedAt: Date }) {
    return this.db.transaction(async (tx) => {
      const [current] = await tx.select().from(mediaAssets).where(eq(mediaAssets.id, id)).for("update");
      if (!current) throw new MediaError("NOT_FOUND", "Media was not found.", 404, id);
      if (current.updatedAt.getTime() !== value.expectedUpdatedAt.getTime()) {
        throw new MediaError("STALE_MEDIA", "This asset changed in another tab. Reload before saving.", 409, id);
      }
      const updatedAt = new Date(Math.max(Date.now(), current.updatedAt.getTime() + 1));
      const [updated] = await tx.update(mediaAssets).set({ altText: value.altText,
        caption: value.caption, isDecorative: value.isDecorative, updatedAt })
        .where(eq(mediaAssets.id, id)).returning();
      return updated;
    });
  }
  async createPending(value: typeof mediaAssets.$inferInsert) {
    const [row] = await this.db.insert(mediaAssets).values(value).returning();
    return row;
  }
  async complete(id: string, metadata: VerifiedMedia) {
    const [row] = await this.db.update(mediaAssets).set({ ...metadata, availability: "ready" })
      .where(and(eq(mediaAssets.id, id), ne(mediaAssets.availability, "ready"))).returning();
    const result = row ?? await this.find(id);
    if (!result) throw new MediaError("NOT_FOUND", "Media was not found.", 404);
    return result;
  }
  async fail(id: string) {
    await this.db.update(mediaAssets).set({ availability: "failed" })
      .where(and(eq(mediaAssets.id, id), eq(mediaAssets.availability, "pending")));
  }
  async discardIncomplete(id: string) {
    const [row] = await this.db.delete(mediaAssets)
      .where(and(eq(mediaAssets.id, id), ne(mediaAssets.availability, "ready"))).returning({ id: mediaAssets.id });
    return Boolean(row);
  }
  references(asset: MediaRecord) { return mediaReferences(this.db, asset); }
  async deletion(id: string) {
    const [job] = await this.db.select().from(mediaDeletions).where(eq(mediaDeletions.id, id));
    return job ?? null;
  }
  async finishDeletion(id: string) {
    await this.db.delete(mediaDeletions).where(eq(mediaDeletions.id, id));
  }
  async stageDeletion(id: string): Promise<MediaDeletion | null> {
    return this.db.transaction(async (tx) => {
      const [asset] = await tx.select().from(mediaAssets).where(eq(mediaAssets.id, id)).for("update");
      if (!asset) {
        const [job] = await tx.select().from(mediaDeletions).where(eq(mediaDeletions.id, id));
        return job ?? null;
      }
      if (asset.availability !== "ready" || !asset.providerId || !asset.secureUrl) {
        throw new MediaError("NOT_READY", "Verify the completed upload before deleting it.", 409);
      }
      if ((await mediaReferences(tx, asset)).length) {
        throw new MediaError("MEDIA_IN_USE", "Remove or replace all content references before deleting this image.", 409);
      }
      // FK checks also catch concurrent or newly added reference types. No remote
      // deletion can run unless this DELETE and durable job both commit.
      await tx.delete(mediaAssets).where(eq(mediaAssets.id, id));
      const [job] = await tx.insert(mediaDeletions).values({ id, provider: asset.provider,
        providerId: asset.providerId, secureUrl: asset.secureUrl, access: asset.access }).returning();
      return job;
    });
  }
}
