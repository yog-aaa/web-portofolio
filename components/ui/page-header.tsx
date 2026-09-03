import { Container } from "./container";

export function PageHeader({ eyebrow, title, introduction }:
  { eyebrow?: string | null; title: string; introduction?: string | null }) {
  return <Container as="header" className="pb-section-compact pt-16 md:pt-24">
    {eyebrow ? <p className="type-metadata mb-5 text-foreground-secondary">{eyebrow}</p> : null}
    <h1 className="max-w-content text-h1 text-balance">{title}</h1>
    {introduction ? <p className="mt-6 max-w-reading text-body-lg text-foreground-secondary">{introduction}</p> : null}
  </Container>;
}
