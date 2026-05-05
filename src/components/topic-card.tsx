"use client";

import Link from "next/link";
import type { Topic } from "./topics-store";
import { Sparkline } from "./sparkline";

const PALETTE = [
  "from-indigo-500 to-violet-500",
  "from-cyan-500 to-sky-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
];

export function TopicCard({ topic }: { topic: Topic }) {
  const closed = topic.status === "closed";
  const total = topic.votes.reduce((a, b) => a + b, 0);
  const initial = topic.title.trim().charAt(0).toUpperCase() || "T";
  const palette = PALETTE[topic.id % PALETTE.length];

  const leadingIndex = topic.votes.reduce(
    (acc, v, i, arr) => (v > (arr[acc] ?? -1) ? i : acc),
    0,
  );
  const leading = topic.options[leadingIndex];
  const leadPct =
    total > 0 ? Math.round(((topic.votes[leadingIndex] ?? 0) / total) * 100) : 0;

  return (
    <Link
      href={`/vote?id=${topic.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-line bg-white p-5 pl-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:scale-[1.005] hover:border-primary-mid hover:shadow-cardHover"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${
          closed
            ? "bg-line"
            : "bg-gradient-to-b from-primary to-accent opacity-90"
        }`}
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          aria-hidden
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette} text-[15px] font-extrabold text-white shadow-card`}
        >
          {initial}
        </div>
        <span
          className={`mt-1 inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold tracking-wider ${
            closed
              ? "border-line bg-bg2 text-ink-muted"
              : "border-ok-border bg-ok-light text-ok"
          }`}
        >
          {closed ? "CLOSED" : "ACTIVE"}
        </span>
      </div>

      <h3 className="mb-1 text-[15px] font-bold leading-tight text-ink">
        {topic.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
        {topic.desc}
      </p>

      {total > 0 ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-ink-soft">
            <span className="truncate text-ink-muted">Leading: {leading}</span>
            <span className="text-primary">{leadPct}%</span>
          </div>
          <Sparkline values={topic.votes} />
        </div>
      ) : (
        <div className="mb-4 h-1.5 w-full rounded-full bg-line" aria-hidden />
      )}

      <div className="flex items-center justify-between text-[12px] text-ink-soft">
        <span className="tabular-nums">{total.toLocaleString()} votes</span>
        <span
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
            closed
              ? "border border-line bg-transparent text-ink-muted group-hover:border-primary group-hover:bg-primary-light group-hover:text-primary"
              : "bg-primary text-white group-hover:bg-primary-dark"
          }`}
        >
          {closed ? "View results" : "Vote now →"}
        </span>
      </div>
    </Link>
  );
}
