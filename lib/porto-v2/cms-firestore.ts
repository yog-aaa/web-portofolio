import "server-only";

import { getServerFirestore } from "@/lib/firebase/admin";

export const cmsCollections = ["projects", "experiences", "education", "credentials", "thoughts", "research", "mediaAssets", "site", "projectCategories", "technologies", "socialLinks", "pages"] as const;
export type CmsCollection = typeof cmsCollections[number];
export function isCmsCollection(value: string): value is CmsCollection {
  return (cmsCollections as readonly string[]).includes(value);
}

export async function getCmsCollection(collection: CmsCollection) {
  const snapshot = await getServerFirestore().collection(collection).limit(100).get();
  return snapshot.docs.map(doc => ({id: doc.id, data: doc.data()})).sort((a, b) =>
    Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
}

export function editableContent(collection: CmsCollection, data: Record<string, unknown>) {
  if (["projects", "thoughts", "research"].includes(collection)) return data.draft ?? data.published ?? {};
  const {source, createdAt, updatedAt, revision, assetId, publicId, sha256, ...content} = data;
  void source; void createdAt; void updatedAt; void revision; void assetId; void publicId; void sha256;
  return content;
}
