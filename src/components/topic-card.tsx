"use client";

import Link from "next/link";
import type { Topic } from "./topics-store";

export function TopicCard({ topic }: { topic: Topic }) {
  const closed = topic.status === "closed";
  const total = topic.votes.reduce((a, b) => a + b, 0);

  return (
    <Link
      href={`/vote?id=${topic.id}`}
      className="group relative block overflow-hidden rounded-[14px] border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-mid hover:shadow-cardHover"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
      <span
        className={`mb-2.5 inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold tracking-wider ${
          closed
            ? "border-line bg-[#F3F4F6] text-ink-soft"
            : "border-ok-border bg-ok-light text-ok"
        }`}
      >
        {closed ? "CLOSED" : "ACTIVE"}
      </span>
      <h3 className="mb-1.5 text-[15px] font-bold leading-tight text-ink">{topic.title}</h3>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">{topic.desc}</p>
      <div className="flex items-center justify-between text-[12px] text-ink-soft">
        <span>{total} votes</span>
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
