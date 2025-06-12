import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // You can change this to other themes

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(({ content, className = "" }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom rendering for code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Custom rendering for blockquotes
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
                {children}
              </blockquote>
            );
          },
          // Custom rendering for tables
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }: any) {
            return (
              <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },
          td({ children }: any) {
            return (
              <td className="border border-gray-300 px-4 py-2">
                {children}
              </td>
            );
          },
          // Custom rendering for headings
          h1({ children }: any) {
            return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
          },
          h2({ children }: any) {
            return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
          },
          h3({ children }: any) {
            return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>;
          },
          // Custom rendering for lists
          ul({ children }: any) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
          },
          ol({ children }: any) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
          },
          li({ children }: any) {
            return <li className="leading-relaxed">{children}</li>;
          },
          // Custom rendering for paragraphs
          p({ children }: any) {
            return <p className="mb-3 leading-relaxed">{children}</p>;
          },
          // Custom rendering for links
          a({ href, children }: any) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          },
          // Custom rendering for emphasis
          em({ children }: any) {
            return <em className="italic">{children}</em>;
          },
          strong({ children }: any) {
            return <strong className="font-semibold">{children}</strong>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
