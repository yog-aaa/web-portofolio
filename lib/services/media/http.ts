import "server-only";

import { AuthorizationError } from "../../auth/authorization";
import { privateResponse } from "../../auth/http";
import { parseAuthEnvironment } from "../../validation/environment";
import { directMediaUploadInput, MAX_MULTIPART_BYTES, mediaMetadataInput, mediaUploadFields,
  readBoundedBody } from "../../validation/media";
import { MediaError } from "./errors";

export function mediaResponse(body: unknown, init?: ResponseInit) {
  return privateResponse(Response.json(body, init));
}

export function mediaFailure(error: unknown) {
  if (error instanceof AuthorizationError) return mediaResponse({ message: error.message }, { status: error.status });
  if (error instanceof MediaError) {
    return mediaResponse({ code: error.code, message: error.message, ...(error.mediaId ? { mediaId: error.mediaId } : {}) }, { status: error.status });
  }
  return mediaResponse({ message: "Media service is temporarily unavailable." }, { status: 503 });
}

export function requireSameOrigin(request: Request) {
  const expected = parseAuthEnvironment({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  }).BETTER_AUTH_URL;
  const origin = request.headers.get("origin");
  if (!origin || origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new MediaError("INVALID_ORIGIN", "The request origin is not allowed.", 403);
  }
}

export async function parseUploadRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) {
    throw new MediaError("CONTENT_TYPE", "Use multipart form data.", 415);
  }
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_MULTIPART_BYTES) {
    throw new MediaError("BODY_SIZE", "The request exceeds the allowed size.", 413);
  }
  const bytes = await readBoundedBody(request.body, MAX_MULTIPART_BYTES);
  const copy = new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body: Uint8Array.from(bytes) });
  const form = await copy.formData().catch(() => { throw new MediaError("INVALID_FORM", "The upload form is invalid."); });
  const allowed = new Set(["file", "category", "access", "altText", "caption", "isDecorative"]);
  for (const key of form.keys()) if (!allowed.has(key) || form.getAll(key).length !== 1) {
    throw new MediaError("INVALID_FORM", "The upload form contains unsupported or repeated fields.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) throw new MediaError("FILE_REQUIRED", "Choose an image to upload.");
  const string = (name: string) => {
    const value = form.get(name);
    if (value === null) return undefined;
    if (typeof value !== "string") throw new MediaError("INVALID_FORM", "The upload form is invalid.");
    return value;
  };
  const decorative = string("isDecorative");
  if (decorative !== undefined && decorative !== "true" && decorative !== "false") {
    throw new MediaError("INVALID_FORM", "The decorative value must be true or false.");
  }
  const parsed = mediaUploadFields.safeParse({
    category: string("category"),
    access: string("access"),
    altText: string("altText"),
    caption: string("caption"),
    isDecorative: decorative === "true",
  });
  if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Check the asset category, access, alt text, and caption.");
  return { file, fields: parsed.data };
}

export async function parseMetadataRequest(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new MediaError("CONTENT_TYPE", "Use application/json.", 415);
  }
  const body = await readBoundedBody(request.body, 8 * 1024);
  let input: unknown;
  try { input = JSON.parse(body.toString("utf8")); }
  catch { throw new MediaError("INVALID_FORM", "The metadata form is invalid."); }
  const parsed = mediaMetadataInput.safeParse(input);
  if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Check the alt text and caption.");
  return parsed.data;
}

export async function parseDirectUploadRequest(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new MediaError("CONTENT_TYPE", "Use application/json.", 415);
  }
  const body = await readBoundedBody(request.body, 16 * 1024);
  let input: unknown;
  try { input = JSON.parse(body.toString("utf8")); }
  catch { throw new MediaError("INVALID_FORM", "The upload request is invalid."); }
  const parsed = directMediaUploadInput.safeParse(input);
  if (!parsed.success) throw new MediaError("INVALID_FIELDS", "Choose a supported image up to 10 MiB and complete its metadata.");
  return parsed.data;
}
