export const mediaCategories = ["profile", "project", "research", "thought", "credential", "social"] as const;
export type MediaCategory = (typeof mediaCategories)[number];
export type MediaAccess = "public" | "private";
export type ImageFormat = "jpg" | "png" | "webp";

export type MediaImageData = {
  id: string;
  access: MediaAccess;
  src: string;
  width: number;
  height: number;
  alt: string;
};

// Provider-neutral owner read model. Provider IDs and credentials stay server-side.
export type MediaAsset = {
  id: string;
  category: MediaCategory | null;
  kind: "image" | "document";
  access: MediaAccess;
  availability: "pending" | "ready" | "failed";
  filename: string;
  mimeType: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  altText: string | null;
  caption: string | null;
  isDecorative: boolean;
  createdAt: string;
  updatedAt: string;
  image: MediaImageData | null;
};

export type MediaReference = { source: string; count: number };
export type MediaDeletionResult = { id: string; status: "deleted" | "pending" };
