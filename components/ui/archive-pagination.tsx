import Link from "next/link";

function href(pathname: string, page: number, filter?: string) {
  const params = new URLSearchParams();
  if (filter && filter !== "all") params.set("filter", filter);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ArchivePagination({ pathname, currentPage, totalPages, filter }: {
  pathname: string; currentPage: number; totalPages: number; filter?: string;
}) {
  if (totalPages <= 1) return null;
  return <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t border-border pt-5">
    {currentPage > 1 ? <Link className="min-h-target py-3 font-medium text-accent-deep underline underline-offset-4"
      href={href(pathname, currentPage - 1, filter)}>← Previous</Link> : <span />}
    <p className="type-metadata text-foreground-secondary">PAGE {currentPage} / {totalPages}</p>
    {currentPage < totalPages ? <Link className="min-h-target py-3 font-medium text-accent-deep underline underline-offset-4"
      href={href(pathname, currentPage + 1, filter)}>Next →</Link> : <span />}
  </nav>;
}
