"use client";

import { useState } from "react";
import Header from "../components/Header";

const SECTIONS = [
  { id: "title", label: "PR Title" },
  { id: "description", label: "PR Description" },
  { id: "changelog", label: "Changelog Entry" },
  { id: "reviewer-notes", label: "Reviewer Notes" },
  { id: "testing-checklist", label: "Testing Checklist" },
];

const TONE_OPTIONS = [
  {
    value: "balanced",
    label: "Balanced",
    description: "Clear and professional. Good default for most teams.",
  },
  {
    value: "concise",
    label: "Concise",
    description: "Bullet points, short sentences. For teams that skim.",
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Thorough context, motivation, edge cases. For complex codebases.",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Professional and structured. Good for enterprise or regulated environments.",
  },
];

const FORMAT_OPTIONS = [
  { value: "markdown", label: "Markdown", description: "GitHub-flavored markdown. Works everywhere." },
  { value: "plain", label: "Plain text", description: "No formatting. For tools that don't render markdown." },
];

type Config = {
  tone: string;
  sections: string[];
  format: string;
};

function generatePrettyrc(config: Config): string {
  return JSON.stringify(config, null, 2);
}

export default function ConfigPage() {
  const [tone, setTone] = useState("balanced");
  const [sections, setSections] = useState(SECTIONS.map((s) => s.id));
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const config: Config = { tone, sections, format };
  const output = generatePrettyrc(config);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".prettyrc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-12 w-full">

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Generate your <code className="text-accent font-mono">.prettyrc</code>
          </h1>
          <p className="text-text-muted leading-relaxed">
            Set your preferences once. Drop the file in any repo. PRetty reads it every time.
          </p>
        </div>

        {/* Tone */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Tone</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value)}
                className={`text-left rounded-lg border px-4 py-4 flex flex-col gap-1 transition-colors ${
                  tone === opt.value
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-text-muted"
                }`}
              >
                <span className="font-medium text-sm text-text-primary">{opt.label}</span>
                <span className="text-xs text-text-muted leading-relaxed">{opt.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sections */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-text-primary">Sections to include</h2>
            <p className="text-xs text-text-muted">Deselect sections your team doesn&apos;t use.</p>
          </div>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
            {SECTIONS.map((s) => {
              const active = sections.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className={`flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                    active ? "bg-surface text-text-primary" : "bg-background text-text-muted"
                  } hover:bg-surface`}
                >
                  <span className={active ? "font-medium" : ""}>{s.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      active
                        ? "bg-accent/20 text-accent"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {active ? "on" : "off"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Format */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Output format</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormat(opt.value)}
                className={`text-left rounded-lg border px-4 py-4 flex flex-col gap-1 transition-colors ${
                  format === opt.value
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-text-muted"
                }`}
              >
                <span className="font-medium text-sm text-text-primary">{opt.label}</span>
                <span className="text-xs text-text-muted leading-relaxed">{opt.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Output */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Your .prettyrc</h2>
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="text-xs font-mono text-text-muted">.prettyrc</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors px-3 py-1 rounded border border-border hover:border-text-muted"
                >
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium px-3 py-1 rounded bg-accent hover:bg-accent-hover text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="px-5 py-4 text-sm font-mono text-text-primary overflow-x-auto leading-relaxed">
              {output}
            </pre>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Drop <code className="text-text-primary font-mono">.prettyrc</code> in your repo root. The CLI picks it up automatically — no flags needed.
          </p>
        </section>

        {/* Install note */}
        <section className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-3">
          <p className="font-semibold text-sm text-text-primary">Using the CLI?</p>
          <pre className="rounded border border-border bg-background px-4 py-3 text-sm font-mono text-text-primary overflow-x-auto">
            npx @alexandrakay/pretty-pr
          </pre>
          <p className="text-xs text-text-muted leading-relaxed">
            Once your <code className="text-text-primary font-mono">.prettyrc</code> is in place, every run uses your preferences automatically.
            No flags needed. Teammates who clone the repo get the same output format.{" "}
            <a href="/cli" className="text-accent hover:underline">Read the CLI docs →</a>
          </p>
        </section>

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
