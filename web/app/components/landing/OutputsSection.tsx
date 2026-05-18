const outputs = [
  {
    title: "PR Title",
    description: "Conventional commit style. Clear, scannable, consistent.",
    example: "feat(auth): add Stripe checkout with webhook validation",
  },
  {
    title: "PR Description",
    description: "What changed, why it changed, and how it works. Written for the reviewer, not just the author.",
  },
  {
    title: "Reviewer Notes",
    description: "The parts that need attention. The parts that don't. Your reviewer knows exactly where to focus before they open a single file.",
  },
  {
    title: "Testing Checklist",
    description: "Auto-generated from your diff. Every scenario that needs verifying, already written out.",
  },
  {
    title: "Changelog Entry",
    description: "Ready to paste into your CHANGELOG.md. Consistent format, every time.",
  },
];

export default function OutputsSection() {
  return (
    <section className="px-6 py-20 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold tracking-tight">One command. Five outputs.</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Whether you paste your commits in the browser or run{" "}
            <code className="font-mono text-sm bg-surface-raised px-1.5 py-0.5 rounded">npx @alexandrakay/pretty-pr</code>{" "}
            in your terminal, PRetty gives you everything your PR needs.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outputs.map((o) => (
            <div key={o.title} className="rounded-lg border border-border bg-background p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">{o.title}</span>
              <p className="text-sm text-text-muted leading-relaxed">{o.description}</p>
              {o.example && (
                <code className="text-xs font-mono text-text-primary bg-surface px-2 py-1.5 rounded mt-1">
                  {o.example}
                </code>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
