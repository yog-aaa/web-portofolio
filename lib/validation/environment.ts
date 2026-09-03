import { X509Certificate } from "node:crypto";
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

function decodeCertificateBundle(value: string): string | undefined {
  try {
    const normalized = value.trim();
    const bytes = Buffer.from(normalized, "base64");

    if (!normalized || bytes.toString("base64") !== normalized) return undefined;

    const pem = bytes.toString("utf8").trim();
    const blocks = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g);

    if (!blocks?.length || pem.replaceAll(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g, "").trim()) {
      return undefined;
    }

    for (const block of blocks) new X509Certificate(block);
    return `${blocks.join("\n")}\n`;
  } catch {
    return undefined;
  }
}

const databaseEnvironmentSchema = z
  .object({
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
    DATABASE_CA_CERT_BASE64: z
      .string()
      .trim()
      .min(1)
      .max(65_536)
      .transform((value, context) => {
        const certificate = decodeCertificateBundle(value);

        if (!certificate) {
          context.addIssue({ code: "custom", message: "Must encode a valid PEM certificate bundle." });
          return z.NEVER;
        }

        return certificate;
      }),
  })
  .transform(({ DATABASE_URL, DATABASE_CA_CERT_BASE64 }) => ({
    DATABASE_URL,
    DATABASE_CA_CERT: DATABASE_CA_CERT_BASE64,
  }));

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

const authEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32).max(512).refine((value) => !/<[^>]+>/.test(value)),
  BETTER_AUTH_URL: z.string().url().refine((value) => {
    const url = new URL(value);
    return !url.username && !url.password && !url.search && !url.hash &&
      url.pathname === "/" && (url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)));
  }).transform((value) => new URL(value).origin),
});

export function parseAuthEnvironment(input: unknown) {
  return parseEnvironment(authEnvironmentSchema, input);
}

export function parseBootstrapEnvironment(input: unknown) {
  return parseEnvironment(z.object({
    BOOTSTRAP_OWNER_NAME: z.string().trim().min(1).max(120),
    BOOTSTRAP_OWNER_EMAIL: z.email().max(254).transform((value) => value.toLowerCase()),
    BOOTSTRAP_OWNER_PASSWORD: z.string().min(12).max(128).refine((value) => !/<[^>]+>/.test(value)),
  }), input);
}
