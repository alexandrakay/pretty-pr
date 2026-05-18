export default function HeroSection() {
  return (
    <section className="px-6 py-24 text-center flex flex-col items-center gap-8">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-3xl">
        Your commits tell the whole story.{" "}
        <span className="text-accent">Your PR should too.</span>
      </h1>
      <p className="text-lg text-text-muted max-w-xl leading-relaxed">
        PRetty turns messy commits into clean pull request descriptions, changelogs,
        and release notes — in seconds. From the browser or your terminal.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <a
          href="/app"
          className="rounded-lg bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Try it free
        </a>
        <code className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono text-text-muted">
          npx prettypr
        </code>
      </div>
      <p className="text-xs text-text-muted">
        No signup required to try. No judgment about your commit messages.
      </p>
    </section>
  );
}
