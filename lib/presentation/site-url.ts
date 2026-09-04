const defaultSiteUrl = "https://yogaagustiansyah.my.id";

export function parseSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL, vercelEnvironment = process.env.VERCEL_ENV) {
  if (!value && vercelEnvironment === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required for a production deployment.");
  }
  let url: URL;
  try {
    url = new URL(value?.trim() || defaultSiteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }
  const isLoopback = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback)) || url.username || url.password ||
    url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin, or an HTTP loopback origin for local development.");
  }
  return new URL(url.origin);
}

export const productionSiteUrl = parseSiteUrl();

export function absoluteSiteUrl(pathname = "/") {
  return new URL(pathname, productionSiteUrl).toString();
}
