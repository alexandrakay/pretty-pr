"use client";

import { useState } from "react";
import { parseOutput, SECTIONS, type ParsedOutput } from "@/app/lib/parseOutput";
import OutputCard from "./OutputCard";
import LoadingSkeleton from "./LoadingSkeleton";

export default function GenerateForm() {
  const [commits, setCommits] = useState("");
  const [branch, setBranch] = useState("");
  const [diff, setDiff] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commits.trim()) return;

    setOutput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commits,
          branch: branch.trim() || undefined,
          diff: diff.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const parsed = parseOutput(output);
  const hasOutput = output.length > 0;

  const showSkeleton = loading && !hasOutput;
  const cards = SECTIONS.filter((s) => parsed[s]);

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="commits" className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Commits
          </label>
          <textarea
            id="commits"
            name="commits"
            rows={10}
            value={commits}
            onChange={(e) => setCommits(e.target.value)}
            placeholder={"Paste your git log output here...\n\ne.g.\n  abc1234 feat: add user auth (Alex, 2 days ago)\n  def5678 fix: token expiry edge case (Alex, 1 day ago)"}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="branch" className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Branch name <span className="normal-case text-text-muted">(optional)</span>
          </label>
          <input
            id="branch"
            name="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. feature/user-auth"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="diff" className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Diff <span className="normal-case text-text-muted">(optional — enables coverage gap detection)</span>
          </label>
          <textarea
            id="diff"
            name="diff"
            rows={6}
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            placeholder={"Paste your git diff output here...\n\ne.g. git diff main...HEAD"}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !commits.trim()}
          className="self-start rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
        >
          {loading ? "Generating..." : output ? "Regenerate" : "Generate PR copy"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {showSkeleton && <LoadingSkeleton />}

      {cards.length > 0 && (
        <div className="flex flex-col gap-4">
          <PRScore parsed={parsed} loading={loading} />
          {cards.map((section) => (
            <div key={section} className="animate-fade-slide-in">
              <OutputCard title={section} content={parsed[section]!} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SCORE_CRITERIA: { label: string; key: keyof ParsedOutput }[] = [
  { label: "PR Title", key: "PR Title" },
  { label: "Description (what/why/how)", key: "PR Description" },
  { label: "Changelog entry", key: "Changelog Entry" },
  { label: "Reviewer notes", key: "Reviewer Notes" },
  { label: "Testing checklist", key: "Testing Checklist" },
  { label: "Risk flag", key: "Risk Flag" },
];

function PRScore({ parsed, loading }: { parsed: ParsedOutput; loading: boolean }) {
  const met = SCORE_CRITERIA.filter((c) => parsed[c.key]?.trim()).length;
  const total = SCORE_CRITERIA.length;
  const complete = met === total;

  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4 flex flex-col gap-3 animate-fade-slide-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">PR quality</span>
        <span className={`text-xs font-semibold ${complete ? "text-green-400" : "text-text-muted"}`}>
          {loading ? "..." : `${met}/${total}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
        {SCORE_CRITERIA.map((c) => {
          const done = Boolean(parsed[c.key]?.trim());
          return (
            <span key={c.key} className={`flex items-center gap-1.5 text-xs ${done ? "text-text-primary" : "text-text-muted opacity-50"}`}>
              <span className={`text-sm ${done ? "text-green-400" : ""}`}>{done ? "✓" : "○"}</span>
              {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
