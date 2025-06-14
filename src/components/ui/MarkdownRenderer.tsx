// MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDeflist from "remark-deflist";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  chunk: string;
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-7 mb-3 text-foreground" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-6 mb-2 text-foreground" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground" {...props} />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      className="text-base font-semibold mt-4 mb-1 text-foreground"
      {...props}
    />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 className="text-sm font-semibold mt-3 mb-1 text-foreground" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-foreground/90" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-inside my-3 pl-6 space-y-1 text-foreground/90"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-inside my-3 pl-6 space-y-1 text-foreground/90"
      {...props}
    />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline focus:outline-2 focus:outline-primary"
    />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold" {...props} />
  ),
  del: (props: React.HTMLAttributes<HTMLElement>) => (
    <del className="line-through text-muted" {...props} />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-primary/40 pl-4 py-2 my-4 bg-surface/50 text-foreground/80"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const { children, className, ...rest } = props;
    const match = className && /language-(\w+)/.exec(className);
    return match ? (
      <pre
        className="bg-surface text-foreground rounded-md p-4 overflow-x-auto my-4 text-sm border border-border"
        tabIndex={0}
      >
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        className="bg-surface text-accent px-1 py-0.5 rounded text-sm font-mono"
        {...rest}
      >
        {children}
      </code>
    );
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-1">
      <table
        className="min-w-full border-collapse border border-border text-foreground"
        {...props}
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-surface" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="even:bg-surface/30" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-border bg-surface px-4 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="max-w-full rounded my-2" {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-border" {...props} />
  ),
  details: (props: React.DetailsHTMLAttributes<HTMLElement>) => (
    <details
      className="my-4 border border-border rounded-lg overflow-hidden"
      {...props}
    />
  ),
  summary: (props: React.HTMLAttributes<HTMLElement>) => (
    <summary
      className="px-4 py-2 bg-surface cursor-pointer font-semibold"
      {...props}
    />
  ),
  sup: (props: React.HTMLAttributes<HTMLElement>) => (
    <sup className="text-xs align-super" {...props} />
  ),
  dl: (props: React.HTMLAttributes<HTMLDListElement>) => (
    <dl className="my-4" {...props} />
  ),
  dt: (props: React.HTMLAttributes<HTMLElement>) => (
    <dt className="font-semibold" {...props} />
  ),
  dd: (props: React.HTMLAttributes<HTMLElement>) => (
    <dd className="ml-4 mb-2" {...props} />
  ),
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ chunk }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath, remarkDeflist]}
    rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
    components={components}
    skipHtml={false}
  >
    {chunk}
  </ReactMarkdown>
);

export default MarkdownRenderer;
