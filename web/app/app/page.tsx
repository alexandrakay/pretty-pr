import GenerateForm from "@/app/components/GenerateForm";

export default function AppPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            P<span className="text-accent">R</span>etty
          </span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-text-muted">
          <a href="/cli" className="hover:text-text-primary transition-colors">CLI docs</a>
          <a href="/app" className="text-accent font-medium">Generator</a>
        </nav>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <GenerateForm />
      </main>
    </div>
  );
}
