import { z } from "zod";

const cloudinaryEnvironment = z.object({
  CLOUDINARY_URL: z.string().trim().refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === "cloudinary:" && Boolean(url.username && url.password && url.hostname) &&
        /^[a-z0-9_-]+$/i.test(url.hostname) && !url.port && !url.search && !url.hash &&
        (url.pathname === "" || url.pathname === "/");
    } catch { return false; }
  }),
  CLOUDINARY_FOLDER_ROOT: z.string().trim().min(1).max(200)
    .regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/),
});

export function parseCloudinaryEnvironment(input: unknown) {
  const result = cloudinaryEnvironment.safeParse(input);
  if (!result.success) {
    throw new Error(`Missing or invalid environment variables: ${[...new Set(result.error.issues.map(issue => issue.path[0]))].join(", ")}.`);
  }
  return result.data;
}
