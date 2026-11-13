import "server-only";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getServerFirestore } from "@/lib/firebase/admin";
import { getCloudinaryContext } from "./cloudinary";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadPortfolioImage(file: File, alt: string) {
  if (file.size === 0) throw new Error("Choose an image.");
  if (!allowed.has(file.type) || file.size > 3_000_000) throw new Error("Use a JPEG, PNG, or WebP image up to 3 MB.");
  if (alt.length < 3 || alt.length > 200) throw new Error("Write descriptive alt text (3–200 characters).");
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const expected = file.type === "image/jpeg" ? "jpeg" : file.type === "image/png" ? "png" : "webp";
  if (metadata.format !== expected || !metadata.width || !metadata.height || metadata.width > 8000 || metadata.height > 8000) {
    throw new Error("The selected file is not a supported image.");
  }
  const {client, folderRoot} = await getCloudinaryContext();
  const id = randomUUID();
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  const upload = await client.uploader.upload(dataUri, {public_id: `${folderRoot}/porto-v2/cms/${id}`,
    overwrite: false, resource_type: "image", type: "upload", tags: ["porto-v2", "cms-upload"]});
  try {
    await getServerFirestore().collection("mediaAssets").doc(id).create({
      source: "cms-upload", filename: file.name, alt, secureUrl: upload.secure_url,
      publicId: upload.public_id, assetId: upload.asset_id, format: upload.format,
      width: upload.width, height: upload.height, bytes: upload.bytes,
      status: "ready", visibility: "public", createdAt: new Date(), updatedAt: new Date(),
    });
  } catch (error) {
    await client.uploader.destroy(upload.public_id, {resource_type: "image"});
    throw error;
  }
  return upload.secure_url;
}
