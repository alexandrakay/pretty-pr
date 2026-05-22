export default function TwoWaysSection() {
  return (
    <section className="px-6 py-20 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <h2 className="text-3xl font-bold tracking-tight text-center">Browser or terminal. Your call.</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="rounded-lg border border-border bg-background p-8 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Web app</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Open a tab, paste your commits, get structured PR copy in seconds. No setup, no config,
              no repo access required.
            </p>
            <a
              href="/app"
              className="self-start text-sm text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Try the web app →
            </a>
          </div>
          <div className="rounded-lg border border-border bg-background p-8 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">CLI</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Install nothing. Run <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">npx pretty-pr</code> in
              any repo. PRetty reads your git log, your diff, and your branch name — and generates
              everything your PR needs.
            </p>
            <pre className="text-xs font-mono bg-surface border border-border rounded-lg p-4 text-text-muted leading-relaxed overflow-x-auto">
{`npx pretty-pr              # fast
npx pretty-pr --diff       # richer output
npx pretty-pr --full       # best results
npx pretty-pr --out pr.md  # export to file`}
            </pre>
            <a
              href="/cli"
              className="self-start text-sm text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Read the CLI docs →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
