// src/components/MarkdownRenderer.tsx

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        h1: ({ children }) => (
          <h1 className="mb-3 mt-4 text-xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 text-lg font-bold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="text-sm">{children}</li>,
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-emerald-700">
                {children}
              </code>
            );
          }
          return (
            <code
              className={`block overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs font-mono text-gray-100 ${className}`}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-3">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-4 border-emerald-300 bg-emerald-50 py-2 pl-4 text-sm italic text-gray-700">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 underline hover:text-emerald-700"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}