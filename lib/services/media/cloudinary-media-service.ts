import "server-only";

import { randomUUID } from "node:crypto";
import type { MediaAsset, MediaDeletionResult, MediaImageData } from "../../domain/media";
import type { MediaDeletion, MediaRecord } from "../../repositories/media";
import { MediaRepository } from "../../repositories/media";
import { directMediaUploadInput, imageFormatFromFile, MAX_IMAGE_BYTES, mediaMetadataInput, mediaUploadFields,
  parseMediaId, validateImage, type DirectMediaUploadInput, type MediaUploadFields } from "../../validation/media";
import type { OwnerPermission } from "../../auth/authorization";
import type { MediaGateway } from "./cloudinary-gateway";
import { MediaError } from "./errors";
import type { MediaService } from "./media-service";
import type { MediaMetadataInput } from "./media-service";

type Authorize = (permission: OwnerPermission) => Promise<unknown>;

function imageFor(row: MediaRecord): MediaImageData | null {
  if (row.kind !== "image" || row.availability !== "ready" || !row.secureUrl || !row.width || !row.height) return null;
  return {
    id: row.id,
    access: row.access,
    src: row.access === "private" ? `/api/admin/media/${row.id}/content` : row.secureUrl,
    width: row.width,
    height: row.height,
    alt: row.isDecorative ? "" : row.altText ?? "",
  };
}

function toDomain(row: MediaRecord): MediaAsset {
  return {
    id: row.id,
    category: row.category,
    kind: row.kind,
    access: row.access,
    availability: row.availability,
    filename: row.filename,
    mimeType: row.mimeType,
    format: row.format,
    width: row.width,
    height: row.height,
    bytes: row.bytes,
    altText: row.altText,
    caption: row.caption,
    isDecorative: row.isDecorative,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    image: imageFor(row),
  };
}

function isForeignKeyViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth += 1) {
    if ("code" in current && current.code === "23503") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export class CloudinaryMediaService implements MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly gateway: MediaGateway,
    private readonly authorize: Authorize,
  ) {}

  async list() {
    await this.authorize("cms:read");
    const [rows, references] = await Promise.all([this.repository.list(), this.repository.referencesForAll()]);
    return rows.map((row) => ({ ...toDomain(row), references: references.get(row.id) ?? [] }));
  }

  async authorizeDirectUpload(input: DirectMediaUploadInput) {
    await this.authorize("cms:write");
    const parsed = directMediaUploadInput.safeParse(input);
    if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Choose a supported image up to 10 MiB and complete its metadata.");
    const fields = parsed.data;
    const format = imageFormatFromFile(fields.filename, fields.mimeType)!;
    const id = randomUUID();
    const identity = this.gateway.identity(id, fields.category, fields.access, format);
    const filename = fields.filename.replace(/\.[^.]*$/, "").replace(/[^\p{L}\p{N} _-]/gu, "")
      .trim().slice(0, 100) || "image";
    const pending = await this.repository.createPending({
      id, provider: "cloudinary", providerId: identity.providerId, category: fields.category,
      kind: "image", access: fields.access, availability: "pending", url: identity.secureUrl,
      secureUrl: identity.secureUrl, filename: `${filename}.${format}`, mimeType: fields.mimeType,
      format, bytes: fields.bytes, altText: fields.isDecorative ? null : fields.altText || null,
      caption: fields.caption || null, isDecorative: fields.isDecorative,
    });
    return this.gateway.authorizeDirectUpload(pending, format);
  }

  async upload(file: File, input: MediaUploadFields): Promise<MediaAsset> {
    await this.authorize("cms:write");
    const parsed = mediaUploadFields.safeParse(input);
    if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Check the asset category, access, alt text, and caption.");
    const fields = parsed.data;
    const image = await validateImage(file);
    const id = randomUUID();
    const identity = this.gateway.identity(id, fields.category, fields.access, image.format);
    const pending = await this.repository.createPending({
      id,
      provider: "cloudinary",
      providerId: identity.providerId,
      category: fields.category,
      kind: "image",
      access: fields.access,
      availability: "pending",
      url: identity.secureUrl,
      secureUrl: identity.secureUrl,
      filename: image.filename,
      mimeType: image.mimeType,
      format: image.format,
      width: image.width,
      height: image.height,
      bytes: image.bytes,
      altText: fields.altText || null,
      caption: fields.caption || null,
      isDecorative: fields.isDecorative,
    });

    try {
      const verified = await this.gateway.upload(pending, image.data, image.format);
      if (verified.format !== image.format || verified.mimeType !== image.mimeType ||
        verified.width !== image.width || verified.height !== image.height) {
        throw new MediaError("UPLOAD_MISMATCH", "The uploaded image does not match the validated image.", 502, id);
      }
      // A session may be revoked while bytes are in flight. Recheck before the
      // provider result becomes an attachable database record.
      await this.authorize("cms:write");
      return toDomain(await this.repository.complete(id, verified));
    } catch (error) {
      await this.repository.fail(id).catch(() => undefined);
      if (error instanceof MediaError) throw error;
      throw new MediaError("UPLOAD_FAILED", "Image upload failed. Check its status before retrying.", 502, id);
    }
  }

  async updateMetadata(id: string, input: MediaMetadataInput): Promise<MediaAsset> {
    await this.authorize("cms:write");
    const mediaId = parseMediaId(id);
    const parsed = mediaMetadataInput.safeParse(input);
    if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Check the alt text and caption.");
    const current = await this.required(mediaId);
    if (current.access === "public" && !parsed.data.isDecorative && !parsed.data.altText) {
      throw new MediaError("ALT_REQUIRED", "Public informative images require alt text.");
    }
    const updated = await this.repository.updateMetadata(mediaId, {
      altText: parsed.data.isDecorative ? null : parsed.data.altText || null,
      caption: parsed.data.caption || null,
      isDecorative: parsed.data.isDecorative,
      expectedUpdatedAt: new Date(parsed.data.expectedUpdatedAt),
    });
    return toDomain(updated);
  }

  async retrieveMetadata(id: string): Promise<MediaAsset> {
    await this.authorize("cms:read");
    const row = await this.required(id);
    if (row.availability === "ready") return toDomain({ ...row, ...(await this.gateway.metadata(row)) });
    return toDomain(row);
  }

  async reconcileUpload(id: string): Promise<MediaAsset> {
    await this.authorize("cms:write");
    const row = await this.required(id);
    if (row.availability === "ready") return toDomain(row);
    try {
      const verified = await this.gateway.metadata(row);
      if (verified.format !== row.format || verified.mimeType !== row.mimeType ||
        verified.bytes === null || verified.bytes > MAX_IMAGE_BYTES) {
        throw new MediaError("UPLOAD_MISMATCH", "The uploaded image does not match the authorized file.", 409, row.id);
      }
      await this.authorize("cms:write");
      return toDomain(await this.repository.complete(row.id, verified));
    } catch (error) {
      if (error instanceof MediaError && ["INVALID_PROVIDER_METADATA", "UPLOAD_MISMATCH"].includes(error.code)) {
        await this.gateway.destroy(row).catch(() => undefined);
        await this.repository.fail(row.id).catch(() => undefined);
      }
      throw error;
    }
  }

  async references(id: string) {
    await this.authorize("cms:read");
    return this.repository.references(await this.required(id));
  }

  async delete(id: string): Promise<MediaDeletionResult> {
    await this.authorize("cms:write");
    const mediaId = parseMediaId(id);
    let job: MediaDeletion | null = await this.repository.deletion(mediaId);
    if (!job) {
      const row = await this.repository.find(mediaId);
      if (!row) return { id: mediaId, status: "deleted" };
      this.gateway.assertManaged(row);
      if (row.availability !== "ready") {
        try {
          await this.gateway.destroy(row);
          if (await this.repository.discardIncomplete(mediaId)) {
            return { id: mediaId, status: "deleted" };
          }
          return await this.repository.find(mediaId)
            ? { id: mediaId, status: "pending" }
            : { id: mediaId, status: "deleted" };
        } catch {
          return { id: mediaId, status: "pending" };
        }
      }
      try {
        job = await this.repository.stageDeletion(mediaId);
      } catch (error) {
        if (isForeignKeyViolation(error)) throw new MediaError("MEDIA_IN_USE", "Remove or replace all content references before deleting this image.", 409, mediaId);
        throw error;
      }
    }
    if (!job) return { id: mediaId, status: "deleted" };
    this.gateway.assertManaged(job);
    try {
      await this.gateway.destroy(job);
      await this.repository.finishDeletion(mediaId);
      return { id: mediaId, status: "deleted" };
    } catch {
      // The durable job remains retryable. Never claim the provider object is gone.
      return { id: mediaId, status: "pending" };
    }
  }

  async getPublicImage(id: string): Promise<MediaImageData | null> {
    const row = await this.repository.find(parseMediaId(id));
    if (!row || row.access !== "public" || row.availability !== "ready") return null;
    this.gateway.assertManaged(row);
    return imageFor(row);
  }

  async readPrivateImage(id: string) {
    await this.authorize("cms:read");
    const row = await this.required(id);
    if (row.access !== "private" || row.availability !== "ready" || !["jpg", "png", "webp"].includes(row.format ?? "")) {
      throw new MediaError("NOT_AVAILABLE", "Private image is unavailable.", 404, row.id);
    }
    const bytes = await this.gateway.privateBytes(row, row.format as "jpg" | "png" | "webp");
    await this.authorize("cms:read");
    return { bytes, mimeType: row.mimeType! };
  }

  private async required(id: string) {
    const mediaId = parseMediaId(id);
    const row = await this.repository.find(mediaId);
    if (!row) throw new MediaError("NOT_FOUND", "Media was not found.", 404, mediaId);
    this.gateway.assertManaged(row);
    return row;
  }
}
