"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Topic, Option } from "@prisma/client";

type T = Topic & { options: Option[] };

export function ResultsClient({ topic }: { topic: T }) {
  const total = useMemo(
    () => topic.options.reduce((s, o) => s + o.voteCount, 0),
    [topic.options],
  );
  const sorted = useMemo(
    () => [...topic.options].sort((a, b) => b.voteCount - a.voteCount),
    [topic.options],
  );
  const winnerId = sorted[0]?.voteCount ? sorted[0].id : null;
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setDisplayTotal(total));
    return () => cancelAnimationFrame(t);
  }, [total]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + `/results/${topic.id}` : "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-tmt-cyan hover:underline">
        ← All topics
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-tmt-text">{topic.title}</h1>
      <p className="mt-2 text-tmt-muted">{topic.description}</p>
      <p className="mt-6 text-lg">
        <span className="text-tmt-muted">Total votes: </span>
        <motion.span
          className="font-display text-3xl font-bold text-tmt-cyan tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {displayTotal}
        </motion.span>
      </p>

      <div className="mt-10 space-y-5">
        {topic.options.map((o, i) => {
          const pct = total === 0 ? 0 : Math.round((o.voteCount / total) * 1000) / 10;
          const win = o.id === winnerId && o.voteCount > 0;
          return (
            <div key={o.id} className="glass rounded-xl p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className={`font-medium ${win ? "text-tmt-cyan" : "text-tmt-text"}`}>
                  {o.optionText}
                  {win ? (
                    <span className="ml-2 text-tmt-purple" aria-label="Leading">
                      👑
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums text-tmt-muted">
                  {o.voteCount} ({pct}%)
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-tmt-surfaceMuted">
                <motion.div
                  className={`h-full rounded-full ${
                    win
                      ? "bg-gradient-to-r from-tmt-cyan to-tmt-purple"
                      : "bg-tmt-cyan/60"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.06, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl border-2 border-tmt-border bg-white/90 px-4 py-2 text-sm text-tmt-muted hover:border-tmt-cyan"
          onClick={() => navigator.clipboard.writeText(shareUrl)}
        >
          Copy link
        </button>
        <a
          className="rounded-xl border-2 border-tmt-border bg-white/90 px-4 py-2 text-sm text-tmt-muted hover:border-tmt-cyan"
          href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="rounded-xl border-2 border-tmt-border bg-white/90 px-4 py-2 text-sm text-tmt-muted hover:border-tmt-cyan"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          X / Twitter
        </a>
      </div>

      <Link
        href="/"
        className="btn-glow mt-10 inline-flex items-center justify-center px-8 py-3"
      >
        Vote on another topic
      </Link>
    </main>
  );
}
