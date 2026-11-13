import { parseCloudinaryEnvironment } from "../validation/environment";

export function cloudinaryDeliveryConfig(input: unknown) {
  const env = parseCloudinaryEnvironment(input);
  return { cloudName: new URL(env.CLOUDINARY_URL).hostname, folderRoot: env.CLOUDINARY_FOLDER_ROOT };
}

export function cloudinaryRemotePatterns(input: unknown) {
  try {
    const { cloudName, folderRoot } = cloudinaryDeliveryConfig(input);
    return [{ protocol: "https" as const, hostname: "res.cloudinary.com", port: "",
      pathname: `/${cloudName}/image/upload/*/${folderRoot}/**`, search: "" }];
  } catch {
    return [];
  }
}
