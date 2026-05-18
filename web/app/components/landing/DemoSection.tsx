import GenerateForm from "@/app/components/GenerateForm";

export default function DemoSection() {
  return (
    <section id="demo" className="px-6 py-20 border-t border-border">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold tracking-tight">See it work. No signup.</h2>
          <p className="text-text-muted">
            Paste your commits below. PRetty handles the rest.
          </p>
        </div>
        <GenerateForm />
        <p className="text-xs text-text-muted text-center">
          Looks good?{" "}
          <code className="font-mono bg-surface px-1.5 py-0.5 rounded">npx prettypr</code>{" "}
          does this from your terminal, reading directly from your git history.
        </p>
      </div>
    </section>
  );
}
