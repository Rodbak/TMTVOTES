"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTopics } from "@/components/topics-store";
import { TopicCard } from "@/components/topic-card";
import { HowItWorks } from "@/components/how-it-works";
import { CountUp } from "@/components/count-up";

export default function HomePage() {
  const { topics } = useTopics();

  const { active, closed, totalVotes } = useMemo(() => {
    const a = topics.filter((t) => t.status === "active");
    const c = topics.filter((t) => t.status === "closed");
    const v = topics.reduce(
      (acc, t) => acc + t.votes.reduce((s, x) => s + x, 0),
      0,
    );
    return { active: a, closed: c, totalVotes: v };
  }, [topics]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-white px-6 pt-14 pb-16 text-center sm:pt-20 sm:pb-20">
        <div className="hero-mesh" />
        <span className="hero-glow left animate-blob-drift" />
        <span className="hero-glow right animate-blob-drift" style={{ animationDelay: "-4s" }} />
        <div className="hero-dots pointer-events-none absolute inset-0" />

        <div className="relative animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-ok-border bg-ok-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ok shadow-card">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" />
            Live voting
          </div>
          <h1 className="animate-rise-in text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-ink">
            Your voice.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Your vote.
            </span>
          </h1>
          <p
            className="mx-auto mt-4 max-w-md animate-rise-in text-[15px] leading-relaxed text-ink-muted"
            style={{ animationDelay: "100ms" }}
          >
            No registration needed — pick a topic, enter your email or phone,
            and vote.
          </p>

          <div
            className="mt-7 flex animate-rise-in flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="#topics"
              className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-cardHover"
            >
              Browse topics
            </Link>
            <Link
              href="#how"
              className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-semibold text-ink-muted transition hover:border-primary hover:text-primary"
            >
              How it works
            </Link>
          </div>

          <div
            className="mx-auto mt-8 flex max-w-md animate-rise-in items-center justify-center gap-6 text-[13px] text-ink-soft"
            style={{ animationDelay: "260ms" }}
          >
            <Stat label="open" value={active.length} accent />
            <span className="h-4 w-px bg-line" />
            <Stat label="votes" value={totalVotes} />
            <span className="h-4 w-px bg-line" />
            <Stat label="archived" value={closed.length} />
          </div>
        </div>
      </section>

      <section
        id="topics"
        className="mx-auto max-w-[860px] scroll-mt-20 px-6 py-10"
      >
        <SectionLabel>Active topics</SectionLabel>
        {active.length === 0 ? (
          <EmptyState
            message="No active topics yet."
            action={
              <Link
                href="/admin"
                className="font-semibold text-primary hover:underline"
              >
                Open the admin to create one →
              </Link>
            }
          />
        ) : (
          <div
            className="stagger grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]"
          >
            {active.map((t, i) => (
              <div key={t.id} style={{ "--i": i } as React.CSSProperties}>
                <TopicCard topic={t} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <SectionLabel>Closed topics</SectionLabel>
          {closed.length === 0 ? (
            <EmptyState message="No closed topics yet." />
          ) : (
            <div
              className="stagger grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]"
            >
              {closed.map((t, i) => (
                <div key={t.id} style={{ "--i": i } as React.CSSProperties}>
                  <TopicCard topic={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <CountUp
        to={value}
        className={`text-[18px] font-extrabold ${
          accent ? "text-primary" : "text-ink"
        }`}
      />
      <span className="text-[12px] uppercase tracking-wider text-ink-soft">
        {label}
      </span>
    </span>
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

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-[13px] text-ink-soft">
      <p>{message}</p>
      {action ? <p className="mt-2 text-[13px]">{action}</p> : null}
    </div>
  );
}
