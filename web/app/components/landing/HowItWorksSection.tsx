const steps = [
  {
    number: "1",
    title: "Connect or paste",
    description: "Link your repo, run the CLI, or paste your commits directly into the web app. PRetty reads your git history and diff — or works with whatever you give it.",
  },
  {
    number: "2",
    title: "Generate",
    description: "Choose what you need — PR description, changelog entry, reviewer notes, or all of it. PRetty reads your commits, understands your changes, and writes the copy your PR should have had.",
  },
  {
    number: "3",
    title: "Ship it",
    description: "Copy to GitHub, export to markdown, or let the GitHub Action post it automatically. Your PR is done. Your team is happy. You can get back to building.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="px-6 py-20 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <h2 className="text-3xl font-bold tracking-tight text-center">Three steps. Seriously.</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col gap-4">
              <span className="text-4xl font-bold text-accent opacity-40">{s.number}</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-text-primary">{s.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
