import Header from "../components/Header";

const flags = [
  {
    flag: "npx @alexandrakay/pretty-pr",
    description: "Commits only. Fastest. Good enough for most PRs.",
  },
  {
    flag: "--diff",
    description: "Includes the git diff. Richer output — better descriptions and testing notes.",
  },
  {
    flag: "--full",
    description: "Everything: commits + diff + branch name. Slowest, best results.",
  },
  {
    flag: "--base <branch>",
    description: "Compare against a specific base branch. Defaults to main.",
  },
  {
    flag: "--range <a..b>",
    description: "Generate from a specific commit range instead of branch diff.",
  },
  {
    flag: "--out <file>",
    description: "Write output to a markdown file instead of printing to terminal.",
  },
  {
    flag: "--open",
    description: "Open a GitHub PR immediately after generating. Requires the gh CLI.",
  },
  {
    flag: "--draft",
    description: "Used with --open. Creates the PR as a draft.",
  },
];

const ladder = [
  {
    input: "Commits only",
    command: "npx @alexandrakay/pretty-pr",
    output: "Decent PR title, okay description, thin on context.",
  },
  {
    input: "Commits + diff",
    command: "npx @alexandrakay/pretty-pr --diff",
    output: "Strong title, solid description, inferred testing notes.",
  },
  {
    input: "Commits + diff + branch",
    command: "npx @alexandrakay/pretty-pr --full",
    output: "Full picture — best title, reviewer notes, complete testing checklist.",
  },
];

export default function CLIPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16 w-full">

        {/* Intro */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">
            P<span className="text-accent">R</span>etty CLI
          </h1>
          <p className="text-text-muted leading-relaxed">
            Run <code className="text-text-primary bg-surface border border-border rounded px-1.5 py-0.5 text-sm font-mono">npx @alexandrakay/pretty-pr</code> inside any repo. It reads your git history,
            understands what you built, and writes the PR description your team deserves.
          </p>
        </div>

        {/* Install */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Install</h2>
          <p className="text-text-muted text-sm leading-relaxed">No install required — run it directly with npx.</p>
          <pre className="rounded-lg border border-border bg-surface px-5 py-4 text-sm font-mono text-text-primary overflow-x-auto">
            npx @alexandrakay/pretty-pr
          </pre>
          <p className="text-text-muted text-sm leading-relaxed">
            Or install globally if you use it every day:
          </p>
          <pre className="rounded-lg border border-border bg-surface px-5 py-4 text-sm font-mono text-text-primary overflow-x-auto">
            npm install -g @alexandrakay/pretty-pr
          </pre>
        </section>

        {/* API Key */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Setup</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            PRetty calls the Anthropic API. You need an API key from{" "}
            <a
              href="https://console.anthropic.com"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              console.anthropic.com
            </a>
            .
          </p>
          <p className="text-text-muted text-sm">Set it as an environment variable:</p>
          <pre className="rounded-lg border border-border bg-surface px-5 py-4 text-sm font-mono text-text-primary overflow-x-auto">
            {`export ANTHROPIC_API_KEY=sk-ant-...`}
          </pre>
          <p className="text-text-muted text-sm">
            Or drop it in a <code className="text-text-primary bg-surface border border-border rounded px-1.5 py-0.5 font-mono">.env.local</code> file at your repo root — PRetty will pick it up automatically.
          </p>
        </section>

        {/* Flags */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight">Commands &amp; flags</h2>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
            {flags.map((f) => (
              <div key={f.flag} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 px-5 py-4 bg-surface">
                <code className="text-accent font-mono text-sm whitespace-nowrap shrink-0 w-52">{f.flag}</code>
                <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Output quality ladder */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Output quality ladder</h2>
            <p className="text-text-muted text-sm leading-relaxed">
              The more context you give PRetty, the better the output. Start with commits-only and upgrade when you need more depth.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {ladder.map((row, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-accent opacity-40">{i + 1}</span>
                  <span className="font-semibold text-text-primary">{row.input}</span>
                </div>
                <pre className="rounded border border-border bg-background px-4 py-3 text-sm font-mono text-text-primary overflow-x-auto">
                  {row.command}
                </pre>
                <p className="text-sm text-text-muted leading-relaxed">{row.output}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What it outputs */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">What you get</h2>
          <p className="text-text-muted text-sm leading-relaxed">Every run produces five sections:</p>
          <ul className="flex flex-col gap-2 text-sm text-text-muted">
            {[
              ["PR Title", "Conventional commit style, clean and specific."],
              ["PR Description", "What changed, why it changed, how to test it."],
              ["Changelog Entry", "Ready to paste into your CHANGELOG.md."],
              ["Reviewer Notes", "What to focus on, what to skip, what's risky."],
              ["Testing Checklist", "Auto-generated from your actual diff."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="text-accent shrink-0">—</span>
                <span>
                  <span className="text-text-primary font-medium">{title}.</span>{" "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Open a PR directly */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Open a PR directly</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            If you have the{" "}
            <a href="https://cli.github.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub CLI
            </a>{" "}
            installed and authenticated, PRetty can open the PR for you:
          </p>
          <pre className="rounded-lg border border-border bg-surface px-5 py-4 text-sm font-mono text-text-primary overflow-x-auto">
            npx @alexandrakay/pretty-pr --full --open
          </pre>
          <p className="text-text-muted text-sm leading-relaxed">
            Add <code className="text-text-primary bg-surface border border-border rounded px-1.5 py-0.5 font-mono">--draft</code> to open it as a draft instead.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-lg border border-border bg-surface p-8 flex flex-col gap-4 items-start">
          <p className="font-semibold text-text-primary">Prefer the browser?</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Paste your commits into the web app and generate PR copy without touching the terminal.
          </p>
          <a
            href="/app"
            className="rounded-lg bg-accent hover:bg-accent-hover px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Try the web app
          </a>
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
