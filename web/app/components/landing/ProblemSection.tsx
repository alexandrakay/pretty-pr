const problems = [
  {
    title: "You iterated your way to working code.",
    body: "Your commit history says checkpoint, claude suggested this, ok works. The code is good. The PR description is blank. Your teammate has no idea what they're reviewing.",
  },
  {
    title: "You know what a good PR looks like.",
    body: 'Clear title. What changed and why. Testing notes. Reviewer guidance. You just don\'t have time to write all of that every single time. So you write "fixes bug" and move on.',
  },
  {
    title: "Your team writes PRs differently.",
    body: "Some write three paragraphs. Some write nothing. There's no standard, no consistency, and no institutional memory. Six months from now someone's in git blame and the PR is useless.",
  },
];

export default function ProblemSection() {
  return (
    <section className="px-6 py-20 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-12 text-center">
          Sound familiar?
        </p>
        <div className="grid sm:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div key={p.title} className="flex flex-col gap-3">
              <h3 className="font-semibold text-text-primary leading-snug">{p.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
