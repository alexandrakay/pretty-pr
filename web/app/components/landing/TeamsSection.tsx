const features = [
  {
    title: ".prettyrc config",
    description: "Commit a config file to your repo. Define your format, your tone, your template. Every engineer on the team gets consistent output without thinking about it.",
  },
  {
    title: "GitHub Action",
    description: "Wire up PRetty once. Every time a PR opens with an empty description, PRetty generates one automatically. No one has to remember. No one has to care.",
  },
  {
    title: "Reviewer summary mode",
    description: "Paste a PR link before you start reviewing. PRetty gives you a plain-English brief — what changed, what to focus on, what you can skip. Review faster. Review better.",
  },
  {
    title: "Custom templates",
    description: "Your team has standards. PRetty follows them. Define the structure once — motivation, approach, testing, ticket reference — and every PR matches it.",
  },
];

export default function TeamsSection() {
  return (
    <section className="px-6 py-20 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold tracking-tight">One standard. Every PR. Every engineer.</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            PRetty isn't just a personal tool. Drop it into your team's workflow and every PR gets
            the same quality — regardless of who wrote it or how they work.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-2">
              <h3 className="font-semibold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="/cli" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
            Set up PRetty for your team →
          </a>
        </div>
      </div>
    </section>
  );
}
