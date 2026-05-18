"use client";

import { useState } from "react";
import { parseOutput, SECTIONS } from "@/app/lib/parseOutput";
import OutputCard from "./OutputCard";

export default function GenerateForm() {
  const [commits, setCommits] = useState("");
  const [branch, setBranch] = useState("");
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
        body: JSON.stringify({ commits, branch: branch.trim() || undefined }),
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
  const hasCards = SECTIONS.some((s) => parsed[s]);

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

      {hasCards && (
        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => {
            const content = parsed[section];
            if (!content) return null;
            return <OutputCard key={section} title={section} content={content} />;
          })}
        </div>
      )}
    </div>
  );
}
