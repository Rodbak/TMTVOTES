import Link from "next/link";
import { isPresentationMode } from "@/lib/presentation-mode";

export function SiteHeader() {
  const presentation = isPresentationMode();
  return (
    <header className="sticky top-0 z-50 border-b border-tmt-border/70 bg-white/85 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-violet-100 font-display text-lg font-bold text-tmt-cyan glow-border">
            T
          </span>
          <div>
            <div className="font-display text-lg font-bold tracking-tight text-tmt-text group-hover:text-tmt-cyan transition-colors">
              TMT Votes
            </div>
            <div className="text-xs text-tmt-muted">Your voice. Your vote.</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {presentation ? (
            <span className="rounded-full border border-amber-400/80 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Demo data
            </span>
          ) : null}
          <nav className="hidden gap-6 text-sm font-medium text-tmt-muted sm:flex">
            <Link href="/" className="hover:text-tmt-cyan transition-colors">
              Topics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
