"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
// @ts-expect-error: Missing type definitions for react-syntax-highlighter
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
// @ts-expect-error: Missing type definitions for react-syntax-highlighter styles
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const CodeBlock = ({
  code,
  language = "tsx",
  title = "",
}: {
  code: string;
  language?: string;
  title?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        {title && <h4 className="text-lg font-medium">{title}</h4>}
        <button onClick={copyToClipboard} className="transition-colors" aria-label="Copy code">
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} className="text-white" />
          )}
        </button>
      </div>
      <div className="overflow-hidden rounded-md">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            borderRadius: "0.375rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
