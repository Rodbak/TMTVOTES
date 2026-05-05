import Link from "next/link";
import { BrandGlyph } from "./brand-glyph";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex max-w-[860px] flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <BrandGlyph />
          <div>
            <p className="text-[13px] font-bold text-ink">TMT Votes</p>
            <p className="text-[11px] text-ink-soft">
              Public voting · live results · no account required
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-ink-soft">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/admin" className="hover:text-primary">
            Admin
          </Link>
          <span>© {new Date().getFullYear()} · Demo build</span>
        </div>
      </div>
    </footer>
  );
}
