import Link from "next/link";
import type { Topic, Option } from "@prisma/client";
import { Countdown } from "./countdown";

type T = Topic & { options: Option[] };

export function TopicCard({ topic, variant }: { topic: T; variant: "active" | "closed" }) {
  const total = topic.options.reduce((s, o) => s + o.voteCount, 0);
  const href = variant === "active" ? `/vote/${topic.id}` : `/results/${topic.id}`;

  return (
    <article className="glass group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
      {topic.featured && (
        <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tmt-purple ring-1 ring-tmt-purple/25">
          Featured
        </span>
      )}
      <h3 className="font-display text-xl font-bold text-tmt-text group-hover:text-tmt-cyan transition-colors">
        {topic.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-tmt-muted">{topic.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-tmt-muted">
        <span>
          <strong className="text-tmt-text">{total}</strong> votes
        </span>
        {topic.endDate && variant === "active" ? (
          <span>
            Ends in <Countdown end={topic.endDate} />
          </span>
        ) : null}
      </div>
      <div className="mt-6">
        <Link
          href={href}
          className={
            variant === "active"
              ? "btn-glow inline-flex w-full items-center justify-center text-center animate-pulse-glow"
              : "inline-flex w-full items-center justify-center rounded-xl border-2 border-tmt-border bg-white/80 py-3 text-sm font-semibold text-tmt-muted transition-all hover:border-tmt-cyan hover:text-tmt-cyan"
          }
        >
          {variant === "active" ? "Vote Now" : "View results"}
        </Link>
      </div>
    </article>
  );
}
