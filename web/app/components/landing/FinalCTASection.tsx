export default function FinalCTASection() {
  return (
    <section className="px-6 py-24 border-t border-border text-center flex flex-col items-center gap-8">
      <h2 className="text-4xl font-bold tracking-tight max-w-xl">
        Stop writing PRs from scratch.
      </h2>
      <p className="text-text-muted max-w-md leading-relaxed">
        Your commits already tell the story. Let PRetty turn them into something your team can
        actually use.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <a
          href="/app"
          className="rounded-lg bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Try the web app
        </a>
        <code className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono text-text-muted">
          npx prettypr
        </code>
      </div>
      <p className="text-xs text-text-muted">
        Free to try. No signup required for the web app. MIT licensed CLI.
      </p>
    </section>
  );
}
