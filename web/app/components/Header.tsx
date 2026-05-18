export default function Header() {
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <a href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
        P<span className="text-accent">R</span>etty
      </a>
      <nav className="flex items-center gap-6 text-sm text-text-muted">
        <a href="/cli" className="hover:text-text-primary transition-colors">CLI docs</a>
        <a href="/config" className="hover:text-text-primary transition-colors">Config</a>
        <a href="/app" className="rounded-lg bg-accent hover:bg-accent-hover px-4 py-2 text-white font-medium transition-colors">
          Try it free
        </a>
      </nav>
    </header>
  );
}
