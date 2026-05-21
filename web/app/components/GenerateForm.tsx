"use client";

import { useState, useEffect } from "react";
import { parseOutput, SECTIONS, type ParsedOutput } from "@/app/lib/parseOutput";
import { DEFAULT_PREFERENCES, type Preferences } from "@/app/lib/prompt";
import OutputCard from "./OutputCard";
import LoadingSkeleton from "./LoadingSkeleton";

const HISTORY_KEY = "prettypr_history";
const HISTORY_MAX = 10;
const PREFS_KEY = "prettypr_preferences";

const TONE_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "formal", label: "Formal" },
] as const;

const SECTION_OPTIONS = [
  { id: "title", label: "PR Title" },
  { id: "description", label: "PR Description" },
  { id: "changelog", label: "Changelog" },
  { id: "reviewer-notes", label: "Reviewer Notes" },
  { id: "testing-checklist", label: "Testing Checklist" },
];

interface HistoryEntry {
  id: string;
  timestamp: number;
  commits: string;
  branch: string;
  diff: string;
  output: string;
  title: string;
}

function extractTitle(output: string): string {
  const match = output.match(/## PR Title\s*\n([^\n]+)/);
  if (match) return match[1].trim();
  const firstLine = output.split("\n").find((l) => l.trim() && !l.startsWith("#"));
  return firstLine?.trim() ?? "Untitled";
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)));
}

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      tone: parsed.tone ?? DEFAULT_PREFERENCES.tone,
      sections: Array.isArray(parsed.sections) ? parsed.sections : DEFAULT_PREFERENCES.sections,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function GenerateForm() {
  const [commits, setCommits] = useState("");
  const [branch, setBranch] = useState("");
  const [diff, setDiff] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setCommits(localStorage.getItem("prettypr_commits") ?? "");
    setBranch(localStorage.getItem("prettypr_branch") ?? "");
    setDiff(localStorage.getItem("prettypr_diff") ?? "");
    setHistory(loadHistory());
    setPreferences(loadPreferences());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem("prettypr_commits", commits), 300);
    return () => clearTimeout(t);
  }, [commits]);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem("prettypr_branch", branch), 300);
    return () => clearTimeout(t);
  }, [branch]);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem("prettypr_diff", diff), 300);
    return () => clearTimeout(t);
  }, [diff]);

  function updatePreferences(update: Partial<Preferences>) {
    setPreferences((prev) => {
      const next = { ...prev, ...update };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function toggleSection(id: string) {
    const next = preferences.sections.includes(id)
      ? preferences.sections.filter((s) => s !== id)
      : [...preferences.sections, id];
    updatePreferences({ sections: next });
  }

  async function runGenerate() {
    if (!commits.trim() || loading) return;

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
          preferences,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setOutput((prev) => prev + chunk);
      }

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        commits,
        branch,
        diff,
        output: accumulated,
        title: extractTitle(accumulated),
      };
      const updated = [entry, ...loadHistory()];
      saveHistory(updated);
      setHistory(updated.slice(0, HISTORY_MAX));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runGenerate();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runGenerate();
    }
  }

  function restoreEntry(entry: HistoryEntry) {
    setCommits(entry.commits);
    setBranch(entry.branch);
    setDiff(entry.diff);
    setOutput(entry.output);
    setShowHistory(false);
  }

  const parsed = parseOutput(output);
  const hasOutput = output.length > 0;
  const showSkeleton = loading && !hasOutput;
  const cards = SECTIONS.filter((s) => parsed[s]);

  async function handleCopyAll() {
    const markdown = SECTIONS
      .filter((s) => parsed[s]?.trim())
      .map((s) => `## ${s}\n\n${parsed[s]}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(markdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div className="flex flex-col gap-8">
      {history.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            History ({history.length})
          </button>
          {showHistory && (
            <div className="absolute top-6 left-0 z-10 w-80 rounded-lg border border-border bg-surface shadow-lg py-1">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => restoreEntry(entry)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-raised transition-colors flex flex-col gap-0.5"
                >
                  <span className="text-xs text-text-primary truncate">{entry.title}</span>
                  <span className="text-xs text-text-muted">{formatRelativeTime(entry.timestamp)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="self-start flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{showSettings ? "▾" : "▸"}</span>
            <span>Preferences</span>
            {(preferences.tone !== "balanced" || preferences.sections.length < SECTION_OPTIONS.length) && (
              <span className="text-accent">•</span>
            )}
          </button>

          {showSettings && (
            <div className="rounded-lg border border-border bg-surface px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Tone</span>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePreferences({ tone: opt.value })}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                        preferences.tone === opt.value
                          ? "bg-accent text-white"
                          : "bg-background border border-border text-text-muted hover:text-text-primary hover:border-text-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Sections</span>
                <div className="flex flex-wrap gap-2">
                  {SECTION_OPTIONS.map((s) => {
                    const active = preferences.sections.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSection(s.id)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-background border border-border text-text-muted hover:text-text-primary hover:border-text-muted"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
          <div className="flex items-center justify-end">
            <button
              onClick={handleCopyAll}
              className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {copiedAll ? "Copied!" : "Copy all"}
            </button>
          </div>
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
