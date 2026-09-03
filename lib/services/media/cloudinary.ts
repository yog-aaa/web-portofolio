import "server-only";

import { parseCloudinaryEnvironment } from "@/lib/validation/environment";

/** Infrastructure context for authorized media services; never UI props. */
export async function getCloudinaryContext() {
  const environment = parseCloudinaryEnvironment({
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_FOLDER_ROOT: process.env.CLOUDINARY_FOLDER_ROOT,
  });
  const credentials = new URL(environment.CLOUDINARY_URL);

  // Load only after validation: the SDK also inspects CLOUDINARY_URL on import.
  const { v2: client } = await import("cloudinary");
  client.config({
    cloud_name: credentials.hostname,
    api_key: decodeURIComponent(credentials.username),
    api_secret: decodeURIComponent(credentials.password),
    secure: true,
  });

  return { client, folderRoot: environment.CLOUDINARY_FOLDER_ROOT, cloudName: credentials.hostname };
}
