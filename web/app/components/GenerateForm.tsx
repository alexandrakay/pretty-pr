"use client";

import { useState, useEffect } from "react";
import LZString from "lz-string";
import { parseOutput, SECTIONS, type ParsedOutput } from "@/app/lib/parseOutput";
import { DEFAULT_PREFERENCES, type Preferences } from "@/app/lib/prompt";
import OutputCard from "./OutputCard";
import LoadingSkeleton from "./LoadingSkeleton";

const SHARE_PARAM = "o";
const SHARE_MAX_URL_LENGTH = 8000;

const HISTORY_KEY = "prettypr_history";
const HISTORY_MAX = 10;
const PREFS_KEY = "prettypr_preferences";

interface GitHubUser {
  username: string;
  avatar: string;
}

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
  const [copiedShare, setCopiedShare] = useState(false);
  const [shareTooLarge, setShareTooLarge] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get(SHARE_PARAM);
    if (shared) {
      const decompressed = LZString.decompressFromEncodedURIComponent(shared);
      if (decompressed) {
        setOutput(decompressed);
        return;
      }
    }
    setCommits(localStorage.getItem("prettypr_commits") ?? "");
    setBranch(localStorage.getItem("prettypr_branch") ?? "");
    setDiff(localStorage.getItem("prettypr_diff") ?? "");
    setHistory(loadHistory());
    setPreferences(loadPreferences());

    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: { authenticated: boolean; username?: string; avatar?: string }) => {
        if (data.authenticated && data.username && data.avatar) {
          setGhUser({ username: data.username, avatar: data.avatar });
        }
      })
      .finally(() => setAuthChecked(true));
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

  async function handleShare() {
    setShareTooLarge(false);
    const compressed = LZString.compressToEncodedURIComponent(output);
    const url = `${window.location.origin}/app?${SHARE_PARAM}=${compressed}`;
    if (url.length > SHARE_MAX_URL_LENGTH) {
      setShareTooLarge(true);
      return;
    }
    window.history.replaceState(null, "", `?${SHARE_PARAM}=${compressed}`);
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1500);
  }

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

      <GitHubImport
        open={showGitHub}
        onToggle={() => setShowGitHub((v) => !v)}
        ghUser={ghUser}
        authChecked={authChecked}
        onImport={(data) => {
          setCommits(data.commits);
          setDiff(data.diff);
          setBranch(data.head);
          setShowGitHub(false);
        }}
      />

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
          <div className="flex items-center justify-end gap-4">
            {shareTooLarge && (
              <span className="text-xs text-red-400">Output too large to share via URL</span>
            )}
            <button
              onClick={handleShare}
              className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {copiedShare ? "Link copied!" : "Share"}
            </button>
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
          {parsed["PR Title"] && parsed["PR Description"] && (
            <FillPR title={parsed["PR Title"]!} description={parsed["PR Description"]!} ghUser={ghUser} />
          )}
        </div>
      )}
    </div>
  );
}

interface GitHubImportProps {
  open: boolean;
  onToggle: () => void;
  onImport: (data: { commits: string; diff: string; head: string }) => void;
  ghUser: GitHubUser | null;
  authChecked: boolean;
}

function GitHubImport({ open, onToggle, onImport, ghUser, authChecked }: GitHubImportProps) {
  const [repos, setRepos] = useState<Array<{ fullName: string; defaultBranch: string }>>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [base, setBase] = useState("");
  const [head, setHead] = useState("");
  const [repoFilter, setRepoFilter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading-repos" | "loading-branches" | "importing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (ghUser && open && repos.length === 0) loadRepos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghUser, open]);

  async function loadRepos() {
    setStatus("loading-repos");
    setErrorMsg("");
    const res = await fetch("/api/github/repos");
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Failed to load repos");
      return;
    }
    setRepos(data);
    setStatus("idle");
  }

  async function handleRepoSelect(fullName: string) {
    setSelectedRepo(fullName);
    setBranches([]);
    setBase("");
    setHead("");
    if (!fullName) return;
    setStatus("loading-branches");
    setErrorMsg("");
    const res = await fetch(`/api/github/branches?repo=${encodeURIComponent(fullName)}`);
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Failed to load branches");
      return;
    }
    setBranches(data);
    const repo = repos.find((r) => r.fullName === fullName);
    if (repo) setBase(repo.defaultBranch);
    setStatus("idle");
  }

  async function handleImport() {
    if (!selectedRepo || !base || !head) return;
    setStatus("importing");
    setErrorMsg("");
    const params = new URLSearchParams({ repo: selectedRepo, base, head });
    const res = await fetch(`/api/github/compare?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Failed to fetch compare");
      return;
    }
    setStatus("idle");
    onImport({ commits: data.commits, diff: data.diff, head });
  }

  const filteredRepos = repos.filter((r) =>
    r.fullName.toLowerCase().includes(repoFilter.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Import from GitHub</span>
        <span className="text-xs text-text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 pt-1">
          {!authChecked && (
            <p className="text-xs text-text-muted">Checking authentication...</p>
          )}

          {authChecked && !ghUser && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-text-muted leading-relaxed">
                Connect your GitHub account to auto-fetch commits and diff from any of your repos.
              </p>
              <a
                href="/api/auth/github"
                className="self-start flex items-center gap-2 rounded bg-accent hover:bg-accent-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Connect with GitHub
              </a>
            </div>
          )}

          {authChecked && ghUser && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ghUser.avatar} alt={ghUser.username} className="w-5 h-5 rounded-full" />
                  <span className="text-xs text-text-primary font-medium">{ghUser.username}</span>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                    Disconnect
                  </button>
                </form>
              </div>

              {status === "loading-repos" && <p className="text-xs text-text-muted">Loading repos...</p>}

              {repos.length > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Search repos..."
                    value={repoFilter}
                    onChange={(e) => setRepoFilter(e.target.value)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <select
                    value={selectedRepo}
                    onChange={(e) => handleRepoSelect(e.target.value)}
                    disabled={status === "loading-branches"}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                  >
                    <option value="">— select a repo —</option>
                    {filteredRepos.map((r) => (
                      <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
                    ))}
                  </select>
                </>
              )}

              {branches.length > 0 && (
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-text-muted">Base</label>
                    <select
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-text-muted">Compare</label>
                    <select
                      value={head}
                      onChange={(e) => setHead(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">— select branch —</option>
                      {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {status === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}

              {branches.length > 0 && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!base || !head || status === "importing"}
                  className="self-start rounded bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {status === "importing" ? "Importing..." : "Import commits & diff"}
                </button>
              )}
            </>
          )}
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

function FillPR({ title, description, ghUser }: { title: string; description: string; ghUser: GitHubUser | null }) {
  const [open, setOpen] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [patToken, setPatToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [prLink, setPrLink] = useState("");

  async function handleFill() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/fill-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, title, description, patToken: patToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong.");
      } else {
        setPrLink(data.url);
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — check your connection.");
    }
  }

  const canFill = prUrl.trim() && (ghUser || patToken.trim());

  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4 flex flex-col gap-3 animate-fade-slide-in">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fill GitHub PR</span>
        <span className="text-xs text-text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 pt-1">
          {ghUser ? (
            <p className="text-xs text-text-muted leading-relaxed">
              Signed in as <span className="text-text-primary font-medium">{ghUser.username}</span>. Paste a PR URL to update its title and description.
            </p>
          ) : (
            <p className="text-xs text-text-muted leading-relaxed">
              Connect GitHub above for one-click fill, or paste a Personal Access Token with <code className="text-text-primary">repo</code> scope.
            </p>
          )}
          <input
            type="url"
            placeholder="https://github.com/owner/repo/pull/123"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {!ghUser && (
            <input
              type="password"
              placeholder="GitHub Personal Access Token (repo scope)"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          )}
          {status === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}
          {status === "success" && (
            <p className="text-xs text-green-400">
              PR updated.{" "}
              <a href={prLink} target="_blank" rel="noopener noreferrer" className="underline">
                View on GitHub →
              </a>
            </p>
          )}
          <button
            type="button"
            onClick={handleFill}
            disabled={!canFill || status === "loading"}
            className="self-start rounded bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {status === "loading" ? "Filling..." : "Fill PR"}
          </button>
        </div>
      )}
    </div>
  );
}
