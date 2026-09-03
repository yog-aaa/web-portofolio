import { ArrowLink } from "./arrow-link";

export function SectionHeader({ index, heading, headingId, intro, href, actionLabel }:
  { index: string; heading: string; headingId?: string; intro?: string | null; href?: string; actionLabel?: string | null }) {
  return <header className="editorial-grid mb-10 items-end md:mb-14">
    <p className="type-metadata col-span-full self-start text-foreground-secondary md:col-span-2 lg:col-span-3">{index}</p>
    <div className="col-span-full md:col-span-6 lg:col-span-7">
      <h2 id={headingId} className="text-h2 text-balance">{heading}</h2>
      {intro ? <p className="mt-4 max-w-reading text-body-lg text-foreground-secondary">{intro}</p> : null}
    </div>
    {href && actionLabel ? <div className="col-span-full mt-4 md:col-span-6 md:col-start-3 lg:col-span-2 lg:col-start-11 lg:mt-0 lg:text-right">
      <ArrowLink href={href}>{actionLabel}</ArrowLink>
    </div> : null}
  </header>;
}
