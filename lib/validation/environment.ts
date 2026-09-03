import { z } from "zod";

// Pure validation shared by Next.js server modules and the standalone Drizzle CLI.
// Do not read process.env here or expose raw Zod errors containing input values.
function credentialUrl(value: string, protocols: string[]): URL | undefined {
  try {
    const url = new URL(value);

    if (
      !protocols.includes(url.protocol) ||
      !url.hostname ||
      !url.username ||
      !url.password ||
      url.hash ||
      /<[^>]+>/.test(decodeURIComponent(value))
    ) {
      return undefined;
    }

    return url;
  } catch {
    return undefined;
  }
}

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .trim()
    .refine((value) => {
      const url = credentialUrl(value, ["postgres:", "postgresql:"]);
      return Boolean(url && url.pathname.length > 1);
    })
    .transform((value) => {
      const url = new URL(value);
      // postgres.js treats sslmode=require as encryption without verification.
      // Both the runtime and Drizzle Kit must verify the server certificate.
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }),
});

const cloudinaryEnvironmentSchema = z.object({
  CLOUDINARY_URL: z
    .string()
    .trim()
    .refine((value) => {
      const url = credentialUrl(value, ["cloudinary:"]);
      return Boolean(
        url &&
          /^[a-z0-9_-]+$/i.test(url.hostname) &&
          !url.port &&
          !url.search &&
          (url.pathname === "" || url.pathname === "/"),
      );
    }),
  CLOUDINARY_FOLDER_ROOT: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/),
});

function parseEnvironment<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => issue.path[0]))];
    throw new Error(`Missing or invalid environment variables: ${names.join(", ")}.`);
  }

  return result.data;
}

export function parseDatabaseEnvironment(input: unknown) {
  return parseEnvironment(databaseEnvironmentSchema, input);
}

export function parseCloudinaryEnvironment(input: unknown) {
  return parseEnvironment(cloudinaryEnvironmentSchema, input);
}
