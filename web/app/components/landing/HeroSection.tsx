"use client";

import { useState, useEffect } from "react";
import CopyButton from "../CopyButton";

type Phase = "before" | "running" | "after";

const COMMITS = [
  { sha: "a1b2c3d", msg: "checkpoint" },
  { sha: "e4f5g6h", msg: "claude suggested this" },
  { sha: "i7j8k9l", msg: "fix" },
  { sha: "m1n2o3p", msg: "ok works" },
  { sha: "q4r5s6t", msg: "asdf" },
];

const OUTPUT_LINES = [
  { text: "## PR Title", style: "accent" },
  { text: "feat(auth): add GitHub OAuth with encrypted cookie session", style: "primary" },
  { text: "", style: "muted" },
  { text: "## PR Description", style: "accent" },
  { text: "**What changed:** Replaced PAT input with OAuth 2.0 flow.", style: "muted" },
  { text: "Tokens encrypted with AES-256-GCM, stored in httpOnly cookie.", style: "muted" },
  { text: "", style: "muted" },
  { text: "**Why:** Long-lived credentials shouldn't touch the browser.", style: "muted" },
  { text: "", style: "muted" },
  { text: "## Testing Checklist", style: "accent" },
  { text: "- [ ] OAuth flow sets encrypted cookie", style: "green" },
  { text: "- [ ] Token decrypts correctly on API requests", style: "green" },
  { text: "- [ ] Disconnect clears session and redirects", style: "green" },
];

const STATS = [
  { value: "~30s", label: "to generate" },
  { value: "5", label: "outputs per PR" },
  { value: "3", label: "ways to use it" },
];

const SCHEDULE: Array<{ phase: Phase; duration: number }> = [
  { phase: "before", duration: 3000 },
  { phase: "running", duration: 1400 },
  { phase: "after", duration: 6000 },
];

export default function HeroSection() {
  const [phase, setPhase] = useState<Phase>("before");
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      idx = (idx + 1) % SCHEDULE.length;
      setPhase(SCHEDULE[idx].phase);
      if (SCHEDULE[idx].phase === "before") setVisibleLines(0);
      timer = setTimeout(tick, SCHEDULE[idx].duration);
    };

    timer = setTimeout(tick, SCHEDULE[0].duration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "after") return;
    setVisibleLines(0);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setVisibleLines(count);
      if (count >= OUTPUT_LINES.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <section className="px-6 py-20 flex flex-col items-center gap-10 text-center">
      <div className="flex flex-col gap-4 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none">
          Bad commits.{" "}
          <span className="text-accent">Great PRs.</span>
        </h1>
        <p className="text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
          PRetty reads your git history and writes the PR description for you —
          title, changelog, reviewer notes, testing checklist. In about 30 seconds.
        </p>
      </div>

      <div className="w-full max-w-2xl rounded-xl border border-border overflow-hidden shadow-2xl text-left bg-[#0d1117]">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-[#161b22] border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-white/30 font-mono">pretty-pr — zsh</span>
        </div>

        <div className="p-5 font-mono text-sm min-h-72">
          {phase === "before" && (
            <div className="flex flex-col gap-0.5 animate-fade-slide-in">
              <div className="flex gap-2 mb-3 text-xs">
                <span className="text-green-400">$</span>
                <span className="text-white/40">git log --oneline</span>
              </div>
              {COMMITS.map((c) => (
                <div key={c.sha} className="flex gap-3">
                  <span className="text-yellow-400/60">{c.sha}</span>
                  <span className="text-red-300/70">{c.msg}</span>
                </div>
              ))}
            </div>
          )}

          {phase === "running" && (
            <div className="flex flex-col gap-2 animate-fade-slide-in">
              <div className="flex gap-2 text-xs mb-1">
                <span className="text-green-400">$</span>
                <span className="text-white/30">git log --oneline</span>
              </div>
              {COMMITS.map((c) => (
                <div key={c.sha} className="flex gap-3 opacity-25 line-through">
                  <span className="text-yellow-400/60">{c.sha}</span>
                  <span className="text-white/40">{c.msg}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <span className="text-green-400">$</span>
                <span className="text-white/80">npx @alexandrakay/pretty-pr --diff</span>
              </div>
              <div className="text-accent/80 text-xs animate-pulse">✦ Generating PR copy...</div>
            </div>
          )}

          {phase === "after" && (
            <div className="flex flex-col gap-0.5 animate-fade-slide-in">
              <div className="flex gap-2 text-xs mb-3">
                <span className="text-green-400">$</span>
                <span className="text-white/30">npx @alexandrakay/pretty-pr --diff</span>
              </div>
              {OUTPUT_LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  className={
                    line.style === "accent" ? "text-accent font-semibold mt-1.5" :
                    line.style === "primary" ? "text-white/90" :
                    line.style === "green" ? "text-green-400/80" :
                    "text-white/50"
                  }
                >
                  {line.text || <>&nbsp;</>}
                </div>
              ))}
              {visibleLines >= OUTPUT_LINES.length && (
                <div className="text-green-400 text-xs mt-3 animate-fade-slide-in">
                  ✓ Done in 4.2s
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
        <a
          href="/app"
          className="w-full sm:w-auto text-center rounded-lg bg-accent hover:bg-accent-hover px-7 py-3 text-sm font-semibold text-white transition-colors"
        >
          Try it free →
        </a>
        <div className="w-full sm:w-auto flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
          <code className="text-sm font-mono text-text-muted flex-1 text-center sm:text-left">
            npx @alexandrakay/pretty-pr
          </code>
          <CopyButton text="npx @alexandrakay/pretty-pr" />
        </div>
        <a
          href="https://github.com/alexandrakay/pretty-pr/tree/main/action"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Add to repo →
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-10 border-t border-border pt-8 w-full max-w-lg">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs text-text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted -mt-4">
        No signup required. No judgment about your commit messages.
      </p>
    </section>
  );
}
