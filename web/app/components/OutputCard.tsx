"use client";

import { useState } from "react";

interface OutputCardProps {
  title: string;
  content: string;
}

export default function OutputCard({ title, content }: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const isRisk = title === "Risk Flag";
  const isCoverage = title === "Coverage Gaps";

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`rounded-lg border flex flex-col ${isRisk ? "border-red-900 bg-red-950/20" : isCoverage ? "border-amber-800 bg-amber-950/20" : "border-border bg-surface-raised"}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isRisk ? "border-red-900" : isCoverage ? "border-amber-800" : "border-border"}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${isRisk ? "text-red-400" : isCoverage ? "text-amber-400" : "text-text-muted"}`}>
          {isRisk ? "⚑ " : isCoverage ? "◈ " : ""}{title}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-4 text-sm text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
        {content}
      </pre>
    </div>
  );
}
