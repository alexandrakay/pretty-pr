const quotes = [
  {
    text: "I vibe code almost exclusively now. PRetty is the one step that makes my work legible to the rest of the team.",
    author: "Developer name",
    handle: "@handle",
  },
  {
    text: "We added the GitHub Action to our repo and PRs got noticeably better within a week. Nobody had to change how they work.",
    author: "Engineering lead",
    handle: "Company name",
  },
  {
    text: "I knew what a good PR looked like. I just never wrote one. Now I don't have to.",
    author: "Developer name",
    handle: "@handle",
  },
];

export default function SocialProofSection() {
  return (
    <section className="px-6 py-20 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          From developers who stopped writing PRs from scratch.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <div key={i} className="rounded-lg border border-border bg-background p-6 flex flex-col gap-4">
              <p className="text-sm text-text-muted leading-relaxed italic">"{q.text}"</p>
              <div className="mt-auto">
                <p className="text-sm font-medium text-text-primary">{q.author}</p>
                <p className="text-xs text-text-muted">{q.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
