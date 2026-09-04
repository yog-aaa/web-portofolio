import type { MediaAsset, MediaDeletionResult, MediaImageData, MediaLibraryAsset, MediaReference } from "../../domain/media";
import type { DirectMediaUploadInput, MediaUploadFields } from "../../validation/media";

export type DirectUploadAuthorization = {
  mediaId: string;
  uploadUrl: string;
  fields: Record<string, string>;
};

export interface MediaService {
  list(): Promise<MediaLibraryAsset[]>;
  authorizeDirectUpload(input: DirectMediaUploadInput): Promise<DirectUploadAuthorization>;
  upload(file: File, fields: MediaUploadFields): Promise<MediaAsset>;
  updateMetadata(id: string, input: MediaMetadataInput): Promise<MediaAsset>;
  retrieveMetadata(id: string): Promise<MediaAsset>;
  reconcileUpload(id: string): Promise<MediaAsset>;
  references(id: string): Promise<MediaReference[]>;
  delete(id: string): Promise<MediaDeletionResult>;
  getPublicImage(id: string): Promise<MediaImageData | null>;
  readPrivateImage(id: string): Promise<{ bytes: Uint8Array; mimeType: string }>;
}

export type MediaMetadataInput = {
  altText: string;
  caption: string;
  isDecorative: boolean;
  expectedUpdatedAt: string;
};
