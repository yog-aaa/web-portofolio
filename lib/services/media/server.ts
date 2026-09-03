import "server-only";

import { requireOwner } from "../../auth/require-owner";
import { getDatabase } from "../../database/client";
import { MediaRepository } from "../../repositories/media";
import { CloudinaryGateway } from "./cloudinary-gateway";
import { CloudinaryMediaService } from "./cloudinary-media-service";
import { getCloudinaryContext } from "./cloudinary";

export async function getMediaService(requestHeaders: globalThis.Headers) {
  // Authorization runs before service configuration so unauthenticated requests
  // cannot probe Cloudinary environment state.
  await requireOwner("cms:read", requestHeaders);
  const repository = new MediaRepository(getDatabase());
  return new CloudinaryMediaService(repository, new CloudinaryGateway(await getCloudinaryContext()),
    (permission) => requireOwner(permission, requestHeaders));
}
