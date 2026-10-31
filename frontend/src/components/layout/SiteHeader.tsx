import { Logo } from "@/components/layout/Logo";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
      <a href="/" className="inline-flex items-center gap-3">
        <Logo />
      </a>
      <nav className="flex items-center gap-4 text-sm">
        <a href="/simulations" className="text-wine underline-offset-4 hover:underline">
          Simulations
        </a>
        {/* Profile module arrives in Phase 3 (auth) */}
      </nav>
    </header>
  );
}
