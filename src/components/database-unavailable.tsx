import Link from "next/link";

/** Shown when PostgreSQL is not reachable (server-rendered, no client boundary). */
export function DatabaseUnavailable() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-tmt-text">
      <div className="glass rounded-2xl border border-tmt-cyan/20 p-8 text-tmt-text shadow-lg">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-tmt-cyan">
          TMT Votes
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Database is not reachable
        </h1>
        <p className="mt-4 text-tmt-muted">
          This app needs PostgreSQL. Nothing is wrong with the site code — the database server in{" "}
          <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">DATABASE_URL</code> is
          not accepting connections (often because Postgres is not running yet).
        </p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-tmt-muted">
          <li>
            <strong className="text-tmt-text">Docker:</strong> install Docker Desktop, then run{" "}
            <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">docker compose up -d</code>
            , then{" "}
            <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">npx prisma db push</code>{" "}
            and{" "}
            <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">npm run db:seed</code>.
          </li>
          <li>
            <strong className="text-tmt-text">Cloud:</strong> use Neon or Supabase, set{" "}
            <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">DATABASE_URL</code> in{" "}
            <code className="rounded bg-tmt-card px-1.5 py-0.5">.env</code>, then run the same Prisma
            commands.
          </li>
        </ol>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-gradient-to-r from-tmt-cyan to-tmt-purple px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
