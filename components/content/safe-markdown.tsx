import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MediaImage } from "@/components/media-image";
import type { PublicMediaReference } from "@/lib/domain/content";

export function SafeMarkdown({ markdown, className = "", media = [], measure = "default", tone = "default",
  headingContext = "section" }: {
  markdown: string; className?: string; media?: PublicMediaReference[];
  measure?: "default" | "article"; tone?: "default" | "research";
  headingContext?: "section" | "article";
}) {
  return <div className={`${measure === "article" ? "max-w-[46rem]" : "max-w-reading"} text-foreground-secondary ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml
      urlTransform={(url, key) => key === "src" && url.startsWith("media:") ? url : defaultUrlTransform(url)}
      components={{
      h1: ({ children }) => headingContext === "article"
        ? <h2 className="mb-5 mt-12 text-h2 text-foreground first:mt-0">{children}</h2>
        : <h3 className="mb-4 mt-10 text-h3 text-foreground first:mt-0">{children}</h3>,
      h2: ({ children }) => headingContext === "article"
        ? <h2 className="mb-5 mt-12 text-h2 text-foreground first:mt-0">{children}</h2>
        : <h3 className="mb-4 mt-10 text-h3 text-foreground first:mt-0">{children}</h3>,
      h3: ({ children }) => <h3 className="mb-3 mt-8 text-h3 text-foreground">{children}</h3>,
      p: ({ children }) => <p className="my-5 first:mt-0 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-5 marker:text-accent">{children}</ul>,
      ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-5 marker:text-accent">{children}</ol>,
      blockquote: ({ children }) => <blockquote className={`my-7 border-l-2 border-accent text-body-lg text-foreground ${tone === "research" ? "bg-accent-very-soft px-5 py-1" : "pl-5"}`}>{children}</blockquote>,
      a: ({ href, children }) => <a href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}
        className="font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep">{children}</a>,
      hr: () => <hr className="my-10 border-0 border-t border-border" />,
      code: ({ className: codeClass, children }) => <code className={codeClass
        ? `${codeClass} font-mono text-caption`
        : "rounded-control bg-accent-very-soft px-1.5 py-0.5 font-mono text-caption text-foreground"}>{children}</code>,
      pre: ({ children }) => <pre className="my-7 overflow-x-auto rounded-media bg-accent-deep p-5 text-accent-foreground">{children}</pre>,
      table: ({ children }) => <div className="my-7 overflow-x-auto border-t border-border-control"><table className="w-full min-w-[32rem] border-collapse text-left text-caption">{children}</table></div>,
      th: ({ children }) => <th className="bg-accent-very-soft border-b border-border-control px-3 py-2 font-medium text-foreground">{children}</th>,
      td: ({ children }) => <td className="border-b border-border px-3 py-3 align-top">{children}</td>,
      img: ({ src }) => {
        const source = typeof src === "string" ? src : "";
        if (!source.startsWith("media:")) return null;
        const id = source.slice("media:".length);
        const item = media.find((reference) => reference.id === id || reference.image.id === id);
        if (!item) return null;
        return <span className="my-8 block" role="group" aria-label={item.caption ?? undefined}>
          <span className="block overflow-hidden rounded-media bg-accent-very-soft">
            <MediaImage image={item.image} sizes="(min-width: 768px) 46rem, 100vw" className="h-auto w-full object-contain" />
          </span>
          {item.caption ? <span className="mt-3 block text-caption text-foreground-secondary">{item.caption}</span> : null}
        </span>;
      },
    }}>{markdown}</ReactMarkdown>
  </div>;
}
