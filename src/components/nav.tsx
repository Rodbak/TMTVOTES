"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./brand-glyph";

export function Nav() {
  const pathname = usePathname() ?? "/";
  const onAdmin = pathname.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-line bg-white/85 px-6 backdrop-blur-md">
      <Link href="/" aria-label="TMT Votes — home">
        <Wordmark />
      </Link>
      <div className="flex gap-2">
        <NavLink href="/" active={!onAdmin}>
          Home
        </NavLink>
        <NavLink href="/admin" active={onAdmin} variant="primary">
          Admin
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  variant = "default",
  children,
}: {
  href: string;
  active: boolean;
  variant?: "default" | "primary";
  children: React.ReactNode;
}) {
  const base =
    "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition";
  const styles =
    variant === "primary"
      ? active
        ? "border-primary bg-primary text-white"
        : "border-line-primary bg-primary-light text-primary hover:bg-white"
      : active
        ? "border-primary bg-primary-light text-primary"
        : "border-line text-ink-muted hover:border-primary hover:bg-primary-light hover:text-primary";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
