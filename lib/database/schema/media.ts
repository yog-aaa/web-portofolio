import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { httpsUrl, mediaAccess, mediaAvailability, mediaKind, nonBlank, timestamps } from "./shared";

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(),
  providerId: text("provider_id"),
  kind: mediaKind("kind").notNull(),
  access: mediaAccess("access").notNull().default("private"),
  availability: mediaAvailability("availability").notNull().default("pending"),
  url: text("url"),
  secureUrl: text("secure_url"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  format: text("format"),
  width: integer("width"),
  height: integer("height"),
  bytes: bigint("bytes", { mode: "number" }),
  altText: text("alt_text"),
  caption: text("caption"),
  credit: text("credit"),
  sourceUrl: text("source_url"),
  isDecorative: boolean("is_decorative").notNull().default(false),
  focalX: integer("focal_x"),
  focalY: integer("focal_y"),
  ...timestamps(),
}, (t) => [
  uniqueIndex("media_provider_identity_unique").on(t.provider, t.providerId),
  index("media_library_idx").on(t.createdAt.desc(), t.id),
  nonBlank("media_provider_nonempty", t.provider), nonBlank("media_filename_nonempty", t.filename),
  nonBlank("media_provider_id_nonempty", t.providerId), nonBlank("media_mime_nonempty", t.mimeType),
  httpsUrl("media_secure_url_https", t.secureUrl), httpsUrl("media_source_https", t.sourceUrl),
  check("media_url_protocol", sql`${t.url} is null or ${t.url} ~ '^https?://[^[:space:]]+$'`),
  check("media_dimensions_positive", sql`(${t.width} is null or ${t.width} > 0) and (${t.height} is null or ${t.height} > 0)`),
  check("media_bytes_safe", sql`${t.bytes} is null or ${t.bytes} between 0 and 9007199254740991`),
  check("media_focal_pair", sql`(${t.focalX} is null and ${t.focalY} is null) or
    (${t.focalX} is not null and ${t.focalY} is not null and ${t.focalX} between 0 and 100 and ${t.focalY} between 0 and 100)`),
  check("media_ready_metadata", sql`${t.availability} <> 'ready' or (
    ${t.providerId} is not null and ${t.secureUrl} is not null and ${t.mimeType} is not null
    and ${t.bytes} is not null and (${t.kind} <> 'image' or (${t.width} is not null and ${t.height} is not null))
  )`),
]);
