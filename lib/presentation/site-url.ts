export const productionSiteUrl = new URL("https://yogaagustiansyah.my.id");

export function absoluteSiteUrl(pathname = "/") {
  return new URL(pathname, productionSiteUrl).toString();
}
