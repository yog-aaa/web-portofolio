import "server-only";

import sharp from "sharp";
import { z } from "zod";
import { mediaCategories, type ImageFormat } from "../domain/media";
import { MediaError } from "../services/media/errors";

// Server upload path stays below Vercel's 4.5 MB request/response ceiling.
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 20_000_000;
const MAX_DIMENSION = 8000;
export const imageMimeTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

export const mediaUploadFields = z.object({
  category: z.enum(mediaCategories),
  access: z.enum(["public", "private"]).default("private"),
  altText: z.string().trim().max(500).default(""),
  caption: z.string().trim().max(2000).default(""),
  isDecorative: z.boolean().default(false),
}).strict().refine((value) => value.access !== "public" || value.isDecorative || value.altText.length > 0);
export type MediaUploadFields = z.input<typeof mediaUploadFields>;

export const mediaMetadataInput = z.object({
  altText: z.string().trim().max(500),
  caption: z.string().trim().max(2000),
  isDecorative: z.boolean(),
  expectedUpdatedAt: z.string().datetime(),
}).strict();

export function parseMediaId(id: unknown): string {
  const result = z.uuid().safeParse(id);
  if (!result.success) throw new MediaError("INVALID_ID", "Invalid media ID.");
  return result.data;
}

export async function validateImage(file: File) {
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new MediaError("FILE_SIZE", "Choose an image up to 3 MiB.", 413);
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  const expected: ImageFormat | undefined = extension === "jpeg" || extension === "jpg" ? "jpg" :
    extension === "png" || extension === "webp" ? extension : undefined;
  if (!expected || file.type !== imageMimeTypes[expected]) {
    throw new MediaError("FILE_TYPE", "Choose a JPEG, PNG, or WebP image with a matching file extension.", 415);
  }
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: "warning", animated: true });
    const metadata = await pipeline.metadata();
    const format = metadata.format === "jpeg" ? "jpg" : metadata.format;
    if (format !== expected || (metadata.pages ?? 1) !== 1 || !metadata.width || !metadata.height ||
      metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) throw new Error("Invalid image.");
    // Fully decode, orient and re-encode: remove EXIF/GPS, trailing payloads, and animation.
    const { data, info } = await pipeline.rotate().toFormat(expected === "jpg" ? "jpeg" : expected).toBuffer({ resolveWithObject: true });
    if (data.length > MAX_IMAGE_BYTES) throw new MediaError("FILE_SIZE", "The processed image exceeds 3 MiB. Resize it and try again.", 413);
    const basename = file.name.split(/[\\/]/).at(-1)!.replace(/\.[^.]*$/, "")
      .replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 100) || "image";
    return { data, format: expected, mimeType: imageMimeTypes[expected], width: info.width, height: info.height,
      bytes: data.length, filename: `${basename}.${expected}` };
  } catch (error) {
    if (error instanceof MediaError) throw error;
    throw new MediaError("INVALID_IMAGE", "The image is invalid, animated, or exceeds 8000 pixels per side / 20 megapixels.", 415);
  }
}

export async function readBoundedBody(body: ReadableStream<Uint8Array> | null, limit: number): Promise<Buffer> {
  if (!body) throw new MediaError("EMPTY_BODY", "A request body is required.");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new MediaError("BODY_SIZE", "The request exceeds the allowed size.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, size);
}
