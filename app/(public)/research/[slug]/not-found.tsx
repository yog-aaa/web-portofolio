import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";

export default function ResearchNotFound() {
  return <main id="main-content" className="flex flex-1 items-center py-section"><Container>
    <p className="type-metadata text-foreground-secondary">RESEARCH NOT FOUND</p>
    <h1 className="mt-5 max-w-[14ch] text-h1 text-balance">This research is not publicly available.</h1>
    <p className="mt-6 max-w-reading text-body-lg text-foreground-secondary">The link may be outdated, or the research may not be published.</p>
    <div className="mt-8"><ArrowLink href="/research">Return to Research</ArrowLink></div>
  </Container></main>;
}
