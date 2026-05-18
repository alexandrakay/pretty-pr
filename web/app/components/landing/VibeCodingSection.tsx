export default function VibeCodingSection() {
  return (
    <section className="px-6 py-20 border-t border-border bg-surface">
      <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold tracking-tight">AI wrote the code.</p>
          <p className="text-2xl font-bold tracking-tight">AI should write the PR.</p>
          <p className="text-2xl font-bold tracking-tight text-accent">The loop closes.</p>
        </div>
        <p className="text-text-muted leading-relaxed">
          Whether you're prompting your way to working software or just moving fast — your team still
          needs to understand what you built. PRetty is the last step in the AI development workflow
          that everyone forgets.
        </p>
      </div>
    </section>
  );
}
