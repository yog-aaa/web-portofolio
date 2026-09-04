import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SafeMarkdown({ markdown, className = "" }: { markdown: string; className?: string }) {
  return <div className={`max-w-reading text-foreground-secondary ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
      h1: ({ children }) => <h2 className="mb-5 mt-12 text-h2 text-foreground first:mt-0">{children}</h2>,
      h2: ({ children }) => <h3 className="mb-4 mt-10 text-h3 text-foreground first:mt-0">{children}</h3>,
      h3: ({ children }) => <h4 className="mb-3 mt-8 text-body-lg font-medium text-foreground">{children}</h4>,
      p: ({ children }) => <p className="my-5 first:mt-0 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-5 marker:text-accent">{children}</ul>,
      ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-5 marker:text-accent">{children}</ol>,
      blockquote: ({ children }) => <blockquote className="my-7 border-l-2 border-accent pl-5 text-body-lg text-foreground">{children}</blockquote>,
      a: ({ href, children }) => <a href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}
        className="font-medium text-accent-deep underline decoration-border-control underline-offset-4 hover:decoration-accent-deep">{children}</a>,
      hr: () => <hr className="my-10 border-0 border-t border-border" />,
      code: ({ className: codeClass, children }) => <code className={codeClass
        ? `${codeClass} font-mono text-caption`
        : "rounded-control bg-accent-very-soft px-1.5 py-0.5 font-mono text-caption text-foreground"}>{children}</code>,
      pre: ({ children }) => <pre className="my-7 overflow-x-auto rounded-media bg-accent-deep p-5 text-accent-foreground">{children}</pre>,
      table: ({ children }) => <div className="my-7 overflow-x-auto"><table className="w-full min-w-[32rem] border-collapse text-left text-caption">{children}</table></div>,
      th: ({ children }) => <th className="border-b border-border-control px-3 py-2 font-medium text-foreground">{children}</th>,
      td: ({ children }) => <td className="border-b border-border px-3 py-3 align-top">{children}</td>,
      img: () => null,
    }}>{markdown}</ReactMarkdown>
  </div>;
}
