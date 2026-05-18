"use client";

import { useState } from "react";
import Header from "../components/Header";

const SECTIONS = [
  "## What this PR does",
  "## What to focus on",
  "## What to skip",
  "## Risk areas",
  "## Questions to ask",
];

function parseReview(text: string): { title: string; content: string }[] {
  const results: { title: string; content: string }[] = [];

  for (let i = 0; i < SECTIONS.length; i++) {
    const start = text.indexOf(SECTIONS[i]);
    if (start === -1) continue;
    const contentStart = start + SECTIONS[i].length;
    const end = i + 1 < SECTIONS.length ? text.indexOf(SECTIONS[i + 1]) : text.length;
    const content = text.slice(contentStart, end === -1 ? text.length : end).trim();
    results.push({ title: SECTIONS[i].replace("## ", ""), content });
  }

  return results;
}

export default function ReviewPage() {
  const [diff, setDiff] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sections = output ? parseReview(output) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!diff.trim()) return;

    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff: diff.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setOutput(accumulated);
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-10 w-full">

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Reviewer brief
          </h1>
          <p className="text-text-muted leading-relaxed">
            Paste a diff. Get a plain-English brief before you start reviewing —
            what changed, what to focus on, what to skip.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            placeholder={`Paste a git diff here...\n\ndiff --git a/src/auth.ts b/src/auth.ts\n--- a/src/auth.ts\n+++ b/src/auth.ts\n...`}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent transition-colors"
            rows={12}
            disabled={loading}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !diff.trim()}
            className="self-start rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            {loading ? "Generating brief..." : output ? "Regenerate" : "Generate reviewer brief"}
          </button>
        </form>

        {sections.length > 0 && (
          <div className="flex flex-col gap-4 animate-fade-slide-in">
            {sections.map((s) => (
              <ReviewCard key={s.title} title={s.title} content={s.content} />
            ))}
          </div>
        )}

        {loading && output === "" && (
          <div className="flex flex-col gap-4">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-3 animate-pulse-subtle"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-4 w-32 bg-border rounded" />
                <div className="h-3 w-full bg-border rounded" />
                <div className="h-3 w-4/5 bg-border rounded" />
              </div>
            ))}
          </div>
        )}

      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-text-muted">
        P<span className="text-accent">R</span>etty — Week 3 of{" "}
        <a href="https://github.com/alexandrakay" className="hover:text-text-primary transition-colors">
          12 weeks building in public
        </a>
      </footer>
    </div>
  );
}

function ReviewCard({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="px-5 py-4 text-sm text-text-muted leading-relaxed whitespace-pre-wrap font-sans">
        {content}
      </pre>
    </div>
  );
}
