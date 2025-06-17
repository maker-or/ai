// MarkdownRenderer.tsx
import { memo, useState, createContext, useContext } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ShikiHighlighter from "react-shiki";
import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { Check, Copy } from "lucide-react";

type CodeComponentProps = ComponentProps<"code"> & ExtraProps;
type MarkdownSize = "default" | "small";

// Context to pass size down to components
const MarkdownSizeContext = createContext<MarkdownSize>("default");

const components: Components = {
  code: CodeBlock as Components["code"],
  pre: ({ children }) => <>{children}</>,
};

function CodeBlock({ children, className, ...props }: CodeComponentProps) {
  const size = useContext(MarkdownSizeContext);
  const match = /language-(\w+)/.exec(className || "");

  // Helper function to safely extract string content from children
  const getChildrenAsString = (children: React.ReactNode): string => {
    if (typeof children === "string") {
      return children;
    }
    if (typeof children === "number") {
      return String(children);
    }
    if (Array.isArray(children)) {
      return children.map((child) => getChildrenAsString(child)).join("");
    }
    if (children && typeof children === "object" && "props" in children) {
      // Handle React elements - extract text content
      return getChildrenAsString((children as any).props?.children) || "";
    }
    return "";
  };

  if (match) {
    const lang = match[1];
    const codeString = getChildrenAsString(children);

    return (
      <div className="rounded-none">
        <Codebar lang={lang} codeString={codeString} />
        <ShikiHighlighter
          language={lang}
          theme={"material-theme-darker"}
          className="text-sm font-mono rounded-b-md"
          showLanguage={false}
        >
          {codeString}
        </ShikiHighlighter>
      </div>
    );
  }

  const inlineCodeClasses =
    size === "small"
      ? "mx-0.5 overflow-auto rounded-md px-1 py-0.5 bg-primary/10 text-foreground font-mono text-xs"
      : "mx-0.5 overflow-auto rounded-md px-2 py-1 bg-primary/10 text-foreground font-mono";

  return (
    <code className={inlineCodeClasses} {...props}>
      {children}
    </code>
  );
}

function Codebar({ lang, codeString }: { lang: string; codeString: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code to clipboard:", error);
    }
  };

  const handleCopyClick = () => {
    copyToClipboard().catch((error) => {
      console.error("Copy operation failed:", error);
    });
  };

  return (
    <div className="flex justify-between bg-theme-bg-secondary items-center px-4 py-2  text-foreground rounded-t-md">
      <span className="text-sm font-mono">{lang}</span>
      <button
        onClick={handleCopyClick}
        className="text-sm cursor-pointer"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function PureMarkdownRendererBlock({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath]]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

const MarkdownRendererBlock = memo(
  PureMarkdownRendererBlock,
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MarkdownRendererBlock.displayName = "MarkdownRendererBlock";

const MarkdownRenderer = memo(
  ({
    chunks,
    id,
    size = "default",
  }: {
    chunks: string[];
    id: string;
    size?: MarkdownSize;
  }) => {
    // Defensive: ensure chunks is always an array
    const safeChunks = Array.isArray(chunks) ? chunks : [];

    const wrapperClasses = "markdown-content max-w-2xl mx-auto p-4   ";

    const proseClasses =
      size === "small"
        ? "prose prose-sm dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none"
        : "prose prose-base dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none";

    return (
      <MarkdownSizeContext.Provider value={size}>
        <div className={wrapperClasses}>
          <div className={proseClasses}>
            {safeChunks.map((chunk, index) => (
              <MarkdownRendererBlock
                content={chunk}
                key={`${id}-chunk-${index}`}
              />
            ))}
          </div>
        </div>
      </MarkdownSizeContext.Provider>
    );
  },
);

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
