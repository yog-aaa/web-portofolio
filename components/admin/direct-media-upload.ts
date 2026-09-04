"use client";

import { MAX_IMAGE_BYTES, type MediaAccess, type MediaAsset, type MediaCategory } from "@/lib/domain/media";

export type DirectUploadFields = {
  category: MediaCategory;
  access: MediaAccess;
  altText: string;
  caption?: string;
  isDecorative?: boolean;
};

type Authorization = { mediaId: string; uploadUrl: string; fields: Record<string, string> };

async function json<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(body.message ?? "The media upload failed.");
  return body;
}

export async function uploadImageDirect(file: File, fields: DirectUploadFields): Promise<MediaAsset> {
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image up to 10 MiB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  const authorization = await json<Authorization>(await fetch("/api/admin/media/direct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, bytes: file.size, ...fields,
      caption: fields.caption ?? "", isDecorative: fields.isDecorative ?? false }),
  }));
  try {
    const providerForm = new FormData();
    for (const [key, value] of Object.entries(authorization.fields)) providerForm.set(key, value);
    providerForm.set("file", file);
    const providerResponse = await fetch(authorization.uploadUrl, { method: "POST", body: providerForm });
    if (!providerResponse.ok) throw new Error("Cloudinary rejected the image. Check its type and size, then try again.");
    const finalized = await json<{ asset: MediaAsset }>(await fetch(`/api/admin/media/${authorization.mediaId}/reconcile`, { method: "POST" }));
    return finalized.asset;
  } catch (error) {
    await fetch(`/api/admin/media/${authorization.mediaId}`, { method: "DELETE" }).catch(() => undefined);
    throw error;
  }
}
