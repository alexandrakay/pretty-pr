"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded border border-border hover:border-border-hover"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
