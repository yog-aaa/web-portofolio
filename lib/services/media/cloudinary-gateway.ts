import "server-only";

import { z } from "zod";
import type { MediaAccess, MediaCategory, ImageFormat } from "../../domain/media";
import { mediaCategories } from "../../domain/media";
import type { MediaRecord, VerifiedMedia } from "../../repositories/media";
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, imageMimeTypes, readBoundedBody } from "../../validation/media";
import { MediaError } from "./errors";
import type { getCloudinaryContext } from "./cloudinary";
import type { DirectUploadAuthorization } from "./media-service";

export type ProviderIdentity = Pick<MediaRecord, "id" | "provider" | "providerId" | "secureUrl" | "access">;
export interface MediaGateway {
  identity(id: string, category: MediaCategory, access: MediaAccess, format: ImageFormat): { providerId: string; secureUrl: string };
  assertManaged(record: ProviderIdentity): void;
  authorizeDirectUpload(record: ProviderIdentity, format: ImageFormat): DirectUploadAuthorization;
  upload(record: ProviderIdentity, bytes: Buffer, format: ImageFormat): Promise<VerifiedMedia>;
  metadata(record: ProviderIdentity): Promise<VerifiedMedia>;
  destroy(record: ProviderIdentity): Promise<void>;
  privateBytes(record: ProviderIdentity, format: ImageFormat): Promise<Uint8Array>;
}

type Context = Awaited<ReturnType<typeof getCloudinaryContext>>;
const providerMetadata = z.object({
  public_id: z.string(), resource_type: z.literal("image"), type: z.enum(["upload", "authenticated"]),
  secure_url: z.url(), version: z.number().int().positive(), format: z.enum(["jpg", "png", "webp"]),
  width: z.number().int().positive().max(8000), height: z.number().int().positive().max(8000),
  bytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
}).refine((value) => value.width * value.height <= MAX_IMAGE_PIXELS);
const deliveryType = (access: MediaAccess) => access === "private" ? "authenticated" : "upload";

export class CloudinaryGateway implements MediaGateway {
  constructor(private readonly context: Context, private readonly fetcher: typeof fetch = fetch) {}

  identity(id: string, category: MediaCategory, access: MediaAccess, format: ImageFormat) {
    const providerId = `${this.context.folderRoot}/${category}/${id}`;
    return { providerId, secureUrl: `https://res.cloudinary.com/${this.context.cloudName}/image/${deliveryType(access)}/${providerId}.${format}` };
  }
  assertManaged(record: ProviderIdentity) {
    const { folderRoot, cloudName } = this.context;
    const suffix = record.providerId?.slice(folderRoot.length + 1).split("/");
    let valid = false;
    try {
      const url = new URL(record.secureUrl ?? "");
      const prefix = `/${cloudName}/image/${deliveryType(record.access)}/`;
      const remainder = url.pathname.slice(prefix.length).replace(/^v[0-9]+\//, "");
      valid = url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.port && !url.search && !url.hash &&
        !url.username && !url.password && url.pathname.startsWith(prefix) &&
        ["jpg", "png", "webp"].some((format) => remainder === `${record.providerId}.${format}`);
    } catch { /* Invalid or foreign locators must never become provider commands. */ }
    if (record.provider !== "cloudinary" || !record.providerId?.startsWith(`${folderRoot}/`) || suffix?.length !== 2 ||
      !mediaCategories.includes(suffix[0] as MediaCategory) || suffix[1] !== record.id || !valid) {
      throw new MediaError("UNMANAGED_ASSET", "This asset does not belong to the configured media namespace.", 409);
    }
  }
  authorizeDirectUpload(record: ProviderIdentity, format: ImageFormat): DirectUploadAuthorization {
    this.assertManaged(record);
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = {
      timestamp,
      public_id: record.providerId!,
      type: deliveryType(record.access),
      format,
      overwrite: false,
      use_filename: false,
      unique_filename: false,
      transformation: "a_auto,fl_strip_profile",
    };
    const signature = this.context.client.utils.api_sign_request(parameters, this.context.apiSecret);
    return {
      mediaId: record.id,
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.context.cloudName}/image/upload`,
      fields: Object.fromEntries(Object.entries({ ...parameters, api_key: this.context.apiKey, signature })
        .map(([key, value]) => [key, String(value)])),
    };
  }
  private normalize(record: ProviderIdentity, raw: unknown): VerifiedMedia {
    const result = providerMetadata.safeParse(raw);
    if (!result.success) throw new MediaError("INVALID_PROVIDER_METADATA", "The provider returned unsupported image metadata.", 502, record.id);
    const data = result.data;
    const secureUrl = `https://res.cloudinary.com/${this.context.cloudName}/image/${deliveryType(record.access)}/v${data.version}/${record.providerId}.${data.format}`;
    if (data.public_id !== record.providerId || data.type !== deliveryType(record.access) || data.secure_url !== secureUrl) {
      throw new MediaError("INVALID_PROVIDER_METADATA", "The provider result does not match the authorized upload.", 502, record.id);
    }
    return { secureUrl, url: secureUrl, format: data.format, mimeType: imageMimeTypes[data.format],
      width: data.width, height: data.height, bytes: data.bytes };
  }
  async upload(record: ProviderIdentity, bytes: Buffer, format: ImageFormat) {
    this.assertManaged(record);
    const raw = await new Promise<unknown>((resolve, reject) => {
      const stream = this.context.client.uploader.upload_stream({
        public_id: record.providerId!, resource_type: "image", type: deliveryType(record.access),
        format, allowed_formats: ["jpg", "png", "webp"], overwrite: false,
        use_filename: false, unique_filename: false, timeout: 60_000,
        ...(record.access === "private" ? { headers: "X-Robots-Tag: noindex" } : {}),
      }, (error, result) => error || !result ? reject(new MediaError("UPLOAD_FAILED", "Image upload failed. Check its status before retrying.", 502, record.id)) : resolve(result));
      stream.on("error", () => reject(new MediaError("UPLOAD_FAILED", "Image upload failed. Check its status before retrying.", 502, record.id)));
      stream.end(bytes);
    });
    return this.normalize(record, raw);
  }
  async metadata(record: ProviderIdentity) {
    this.assertManaged(record);
    try {
      const raw: unknown = await this.context.client.api.resource(record.providerId!, {
        resource_type: "image", type: deliveryType(record.access), timeout: 20_000,
      });
      return this.normalize(record, raw);
    } catch (error) {
      if (error instanceof MediaError) throw error;
      throw new MediaError("METADATA_UNAVAILABLE", "Image metadata could not be verified with the provider.", 502, record.id);
    }
  }
  async destroy(record: ProviderIdentity) {
    this.assertManaged(record);
    const result: unknown = await this.context.client.uploader.destroy(record.providerId!, {
      resource_type: "image", type: deliveryType(record.access), invalidate: true,
    });
    if (!z.object({ result: z.enum(["ok", "not found"]) }).safeParse(result).success) {
      throw new MediaError("DELETE_PENDING", "Provider deletion is pending. Retry deletion using the same media ID.", 502, record.id);
    }
  }
  async privateBytes(record: ProviderIdentity, format: ImageFormat) {
    this.assertManaged(record);
    if (record.access !== "private") throw new MediaError("NOT_PRIVATE", "Use the public image delivery URL.", 409);
    const url = this.context.client.utils.private_download_url(record.providerId!, format, {
      resource_type: "image", type: "authenticated", attachment: false, expires_at: Math.floor(Date.now() / 1000) + 60,
    });
    // Signed API URL stays on the server; never redirect the browser to it.
    const target = new URL(url);
    if (target.origin !== "https://api.cloudinary.com" || target.pathname !== `/v1_1/${this.context.cloudName}/image/download`) {
      throw new MediaError("PRIVATE_DELIVERY_FAILED", "Private image delivery is unavailable.", 502);
    }
    const response = await this.fetcher(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000) });
    if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== imageMimeTypes[format]) {
      throw new MediaError("PRIVATE_DELIVERY_FAILED", "Private image delivery is unavailable.", 502);
    }
    return readBoundedBody(response.body, MAX_IMAGE_BYTES);
  }
}
