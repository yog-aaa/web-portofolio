import type { MediaAsset, MediaDeletionResult, MediaImageData, MediaReference } from "../../domain/media";
import type { MediaUploadFields } from "../../validation/media";

export interface MediaService {
  upload(file: File, fields: MediaUploadFields): Promise<MediaAsset>;
  retrieveMetadata(id: string): Promise<MediaAsset>;
  reconcileUpload(id: string): Promise<MediaAsset>;
  references(id: string): Promise<MediaReference[]>;
  delete(id: string): Promise<MediaDeletionResult>;
  getPublicImage(id: string): Promise<MediaImageData | null>;
  readPrivateImage(id: string): Promise<{ bytes: Uint8Array; mimeType: string }>;
}
