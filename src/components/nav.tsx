"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname() ?? "/";
  const onAdmin = pathname.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-line bg-white px-6">
      <Link href="/" className="text-[1.2rem] font-extrabold tracking-tight text-ink">
        TMT<span className="text-primary">Votes</span>
      </Link>
      <div className="flex gap-2">
        <Link
          href="/"
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            !onAdmin
              ? "border-primary bg-primary-light text-primary"
              : "border-line text-ink-muted hover:border-primary hover:bg-primary-light hover:text-primary"
          }`}
        >
          Home
        </Link>
        <Link
          href="/admin"
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            onAdmin
              ? "border-primary bg-primary-light text-primary"
              : "border-line-primary bg-primary-light text-primary hover:bg-white"
          }`}
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
