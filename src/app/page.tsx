"use client";

import { useMemo } from "react";
import { useTopics } from "@/components/topics-store";
import { TopicCard } from "@/components/topic-card";

export default function HomePage() {
  const { topics } = useTopics();

  const { active, closed } = useMemo(
    () => ({
      active: topics.filter((t) => t.status === "active"),
      closed: topics.filter((t) => t.status === "closed"),
    }),
    [topics],
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-white px-6 py-14 text-center">
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-ok-border bg-ok-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ok">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" />
            Live voting
          </div>
          <h1 className="mb-3 text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold leading-[1.15] text-ink">
            Your voice.
            <br />
            <span className="text-primary">Your vote.</span>
          </h1>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-ink-muted">
            No registration needed — pick a topic, enter your email or phone, and vote.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-6 py-6">
        <SectionLabel>Active topics</SectionLabel>
        {active.length === 0 ? (
          <EmptyState message="No active topics yet." />
        ) : (
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {active.map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
          </div>
        )}

        <div className="mt-6">
          <SectionLabel>Closed topics</SectionLabel>
          {closed.length === 0 ? (
            <EmptyState message="No closed topics yet." />
          ) : (
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {closed.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line bg-white px-6 py-10 text-center text-[13px] text-ink-soft">
      {message}
    </div>
  );
}
