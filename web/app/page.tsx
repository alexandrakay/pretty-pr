export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            P<span className="text-accent">R</span>etty
          </span>
          <span className="text-text-muted text-sm hidden sm:block">
            Your commits tell the whole story. Your PR should too.
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <p className="text-text-muted text-sm">Coming soon.</p>
      </main>
    </div>
  );
}
