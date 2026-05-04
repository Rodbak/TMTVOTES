"use client";

import { useEffect } from "react";
import { isDbConnectionError } from "@/lib/is-db-connection-error";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const dbDown = isDbConnectionError(error);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="glass rounded-2xl border border-tmt-cyan/20 p-8 text-tmt-text shadow-lg">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-tmt-cyan">
          TMT Votes
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {dbDown ? "Database is not reachable" : "Something went wrong"}
        </h1>
        <p className="mt-4 text-tmt-muted">
          {dbDown
            ? "This app needs PostgreSQL. Your machine is not connecting to the server in DATABASE_URL (often localhost:5432 when Postgres is not running)."
            : "An unexpected error occurred while loading this page."}
        </p>

        {dbDown ? (
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-tmt-muted">
            <li>
              <strong className="text-tmt-text">Docker:</strong> install Docker Desktop, then from the project folder run{" "}
              <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">
                docker compose up -d
              </code>
              , then{" "}
              <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">
                npx prisma db push
              </code>{" "}
              and{" "}
              <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">
                npm run db:seed
              </code>
              .
            </li>
            <li>
              <strong className="text-tmt-text">Cloud Postgres:</strong> create a database on Neon or Supabase, set{" "}
              <code className="rounded bg-tmt-card px-1.5 py-0.5 text-tmt-cyan">
                DATABASE_URL
              </code>{" "}
              in <code className="rounded bg-tmt-card px-1.5 py-0.5">.env</code>, then run the same Prisma commands.
            </li>
          </ol>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-gradient-to-r from-tmt-cyan to-tmt-purple px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
