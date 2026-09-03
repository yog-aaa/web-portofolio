import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import * as schema from "../lib/database/schema";
import type { Database } from "../lib/database/connection";
import { MediaRepository, type MediaRecord, type VerifiedMedia } from "../lib/repositories/media";
import { CloudinaryMediaService } from "../lib/services/media/cloudinary-media-service";
import { CloudinaryGateway } from "../lib/services/media/cloudinary-gateway";
import type { MediaGateway, ProviderIdentity } from "../lib/services/media/cloudinary-gateway";
import { MediaError } from "../lib/services/media/errors";
import { AuthorizationError } from "../lib/auth/authorization";
import type { ImageFormat, MediaAccess, MediaCategory } from "../lib/domain/media";
import { MAX_IMAGE_BYTES, readBoundedBody, validateImage } from "../lib/validation/media";
import { cloudinaryRemotePatterns } from "../lib/config/cloudinary-delivery";

class FakeGateway implements MediaGateway {
  uploads = 0;
  metadataReads = 0;
  deletes = 0;
  failDelete = false;

  identity(id: string, category: MediaCategory, access: MediaAccess, format: ImageFormat) {
    const providerId = `test-root/${category}/${id}`;
    const type = access === "private" ? "authenticated" : "upload";
    return { providerId, secureUrl: `https://res.cloudinary.com/test-cloud/image/${type}/${providerId}.${format}` };
  }
  assertManaged(record: ProviderIdentity) {
    if (record.provider !== "cloudinary" || !record.providerId?.startsWith("test-root/") ||
      !record.providerId.endsWith(`/${record.id}`) || !record.secureUrl?.startsWith("https://res.cloudinary.com/test-cloud/image/")) {
      throw new MediaError("UNMANAGED_ASSET", "Unmanaged asset.", 409);
    }
  }
  private verified(record: ProviderIdentity): VerifiedMedia {
    const row = record as MediaRecord;
    const versioned = record.secureUrl!.replace(/\/(upload|authenticated)\//, "/$1/v1/");
    return { secureUrl: versioned, url: versioned, format: row.format, mimeType: row.mimeType,
      width: row.width, height: row.height, bytes: row.bytes };
  }
  async upload(record: ProviderIdentity) { this.uploads += 1; return this.verified(record); }
  async metadata(record: ProviderIdentity) { this.metadataReads += 1; return this.verified(record); }
  async destroy() { this.deletes += 1; if (this.failDelete) throw new Error("provider unavailable"); }
  async privateBytes() { return Uint8Array.from([137, 80, 78, 71]); }
}

async function fixture() {
  const client = new PGlite();
  const directory = resolve(__dirname, "../drizzle");
  for (const file of (await readdir(directory)).filter((value) => value.endsWith(".sql")).sort()) {
    await client.exec(await readFile(resolve(directory, file), "utf8"));
  }
  const db = drizzle(client, { schema }) as unknown as Database;
  const gateway = new FakeGateway();
  let allowed = true;
  const service = new CloudinaryMediaService(new MediaRepository(db), gateway, async () => {
    if (!allowed) throw new AuthorizationError(401);
  });
  return { client, db, gateway, service, deny: () => { allowed = false; }, allow: () => { allowed = true; } };
}

function denied(code: string) {
  return (error: unknown) => error instanceof MediaError && error.code === code;
}

test("media uploads are authorized, sanitized, persisted, rendered and metadata-verifiable", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  const source = await sharp({ create: { width: 8, height: 6, channels: 4, background: "#526D82" } }).png().withMetadata().toBuffer();
  const file = new File([source], "profile.photo.png", { type: "image/png" });

  f.deny();
  await assert.rejects(f.service.upload(file, { category: "profile", access: "public", altText: "Portrait", isDecorative: false }),
    (error: unknown) => error instanceof AuthorizationError);
  assert.equal(f.gateway.uploads, 0);
  assert.equal((await f.db.select().from(schema.mediaAssets)).length, 0);

  f.allow();
  const asset = await f.service.upload(file, { category: "profile", access: "public", altText: "Portrait", isDecorative: false });
  assert.equal(asset.availability, "ready");
  assert.equal(asset.image?.width, 8);
  assert.equal(asset.image?.src.includes("/upload/v1/test-root/profile/"), true);
  assert.equal("providerId" in asset, false);
  const [stored] = await f.db.select().from(schema.mediaAssets).where(eq(schema.mediaAssets.id, asset.id));
  assert.equal(stored.availability, "ready");
  assert.equal(stored.bytes! < source.length, true, "sanitization strips metadata before persistence");
  assert.equal((await f.service.getPublicImage(asset.id))?.alt, "Portrait");
  await f.service.retrieveMetadata(asset.id);
  assert.equal(f.gateway.metadataReads, 1);

  const privateAsset = await f.service.upload(new File([source], "private.png", { type: "image/png" }),
    { category: "credential", access: "private", altText: "", isDecorative: false });
  assert.equal(privateAsset.image?.src, `/api/admin/media/${privateAsset.id}/content`);
  assert.equal(await f.service.getPublicImage(privateAsset.id), null);
  const bytes = await f.service.readPrivateImage(privateAsset.id);
  assert.equal(bytes.mimeType, "image/png");
  assert.deepEqual([...bytes.bytes], [137, 80, 78, 71]);
});

test("validation rejects disguised, oversized and unbounded image input", async () => {
  await assert.rejects(validateImage(new File(["<svg></svg>"], "attack.png", { type: "image/png" })), denied("INVALID_IMAGE"));
  await assert.rejects(validateImage(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", { type: "image/png" })), denied("FILE_SIZE"));
  const stream = new ReadableStream<Uint8Array>({ start(controller) {
    controller.enqueue(new Uint8Array(8)); controller.enqueue(new Uint8Array(8)); controller.close();
  } });
  await assert.rejects(readBoundedBody(stream, 10), denied("BODY_SIZE"));
});

test("referenced assets cannot be deleted and provider failures leave a durable retry", async (t) => {
  const f = await fixture();
  t.after(() => f.client.close());
  const source = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).jpeg().toBuffer();
  const asset = await f.service.upload(new File([source], "work.jpg", { type: "image/jpeg" }),
    { category: "project", access: "public", altText: "Work", isDecorative: false });
  await f.db.insert(schema.profile).values({ displayName: "Test Owner", biographyMarkdown: `![Work](${asset.image!.src})` });
  assert.deepEqual(await f.service.references(asset.id), [{ source: "profile", count: 1 }]);
  await assert.rejects(f.service.delete(asset.id), denied("MEDIA_IN_USE"));
  assert.equal(f.gateway.deletes, 0);

  await f.db.update(schema.profile).set({ biographyMarkdown: null }).where(eq(schema.profile.id, 1));
  f.gateway.failDelete = true;
  assert.equal((await f.service.delete(asset.id)).status, "pending");
  assert.equal((await f.db.select().from(schema.mediaAssets).where(eq(schema.mediaAssets.id, asset.id))).length, 0);
  assert.equal((await f.db.select().from(schema.mediaDeletions).where(eq(schema.mediaDeletions.id, asset.id))).length, 1);
  f.gateway.failDelete = false;
  assert.equal((await f.service.delete(asset.id)).status, "deleted");
  assert.equal((await f.db.select().from(schema.mediaDeletions)).length, 0);
});

test("Cloudinary optimizer allowlist is limited to one account and project namespace", () => {
  assert.deepEqual(cloudinaryRemotePatterns({
    CLOUDINARY_URL: "cloudinary://key:secret@test-cloud", CLOUDINARY_FOLDER_ROOT: "test-root",
  }), [{ protocol: "https", hostname: "res.cloudinary.com", port: "", pathname: "/test-cloud/image/upload/*/test-root/*/*", search: "" }]);
  assert.deepEqual(cloudinaryRemotePatterns({ CLOUDINARY_FOLDER_ROOT: "test-root" }), []);
});

test("Cloudinary gateway fixes provider identity, verifies metadata, and keeps signed downloads server-side", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const providerId = `test-root/profile/${id}`;
  const secureUrl = `https://res.cloudinary.com/test-cloud/image/authenticated/v7/${providerId}.png`;
  const providerResult = { public_id: providerId, resource_type: "image", type: "authenticated",
    secure_url: secureUrl, version: 7, format: "png", width: 2, height: 2, bytes: 12 };
  let uploadOptions: Record<string, unknown> | undefined;
  let destroyOptions: Record<string, unknown> | undefined;
  let fetchedUrl = "";
  const client = {
    uploader: {
      upload_stream(options: Record<string, unknown>, callback: (error: unknown, result?: unknown) => void) {
        uploadOptions = options;
        const stream = new PassThrough();
        stream.on("finish", () => callback(undefined, providerResult));
        return stream;
      },
      async destroy(_publicId: string, options: Record<string, unknown>) { destroyOptions = options; return { result: "ok" }; },
    },
    api: { async resource() { return providerResult; } },
    utils: { private_download_url() {
      return "https://api.cloudinary.com/v1_1/test-cloud/image/download?timestamp=1&signature=server-only";
    } },
  };
  const gateway = new CloudinaryGateway({ client, folderRoot: "test-root", cloudName: "test-cloud" } as never,
    (async (url: string | URL | Request) => {
      fetchedUrl = String(url);
      return new Response(Uint8Array.from([1, 2, 3]), { headers: { "content-type": "image/png" } });
    }) as typeof fetch);
  const identity = gateway.identity(id, "profile", "private", "png");
  const record = { id, provider: "cloudinary", providerId: identity.providerId,
    secureUrl: identity.secureUrl, access: "private" as const };
  assert.equal((await gateway.upload(record, Buffer.from([1, 2, 3]), "png")).secureUrl, secureUrl);
  assert.equal(uploadOptions?.type, "authenticated");
  assert.equal(uploadOptions?.overwrite, false);
  assert.equal(uploadOptions?.public_id, providerId);
  assert.equal("api_secret" in uploadOptions!, false);
  assert.equal((await gateway.metadata(record)).width, 2);
  await gateway.destroy(record);
  assert.equal(destroyOptions?.invalidate, true);
  assert.deepEqual([...(await gateway.privateBytes(record, "png"))], [1, 2, 3]);
  assert.match(fetchedUrl, /^https:\/\/api\.cloudinary\.com\/v1_1\/test-cloud\/image\/download\?/);
  assert.equal(fetchedUrl.includes("server-only"), true);

  await assert.rejects(gateway.metadata({ ...record, providerId: "other-root/profile/foreign" }), denied("UNMANAGED_ASSET"));
});
