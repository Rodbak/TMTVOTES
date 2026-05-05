"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/confetti";
import { CountUp } from "@/components/count-up";
import { useTopics } from "@/components/topics-store";

type IdType = "email" | "phone";

export default function VotePage() {
  return (
    <Suspense fallback={<VoteSkeleton />}>
      <VotePageInner />
    </Suspense>
  );
}

function VotePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams?.get("id") ?? "";
  const topicId = Number(idParam);
  const { topics, hasVoted, vote } = useTopics();

  const topic = useMemo(
    () =>
      Number.isFinite(topicId) ? topics.find((t) => t.id === topicId) ?? null : null,
    [topics, topicId],
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [idType, setIdType] = useState<IdType>("email");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!topic) return;
    if (topic.status === "closed" || hasVoted(topic.id)) {
      setShowResults(true);
    }
  }, [topic, hasVoted]);

  if (!topic) {
    return (
      <main className="relative mx-auto min-h-[60vh] max-w-[580px] overflow-hidden px-6 py-12">
        <div className="hero-dots pointer-events-none absolute inset-0 -z-10" />
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[13px] text-ink-soft hover:text-primary"
        >
          ← All topics
        </button>
        <div className="mt-6 animate-rise-in rounded-2xl border border-line bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg2 text-[20px] text-ink-soft">
            ?
          </div>
          <h1 className="text-lg font-extrabold">Topic not found</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            This topic does not exist or was deleted by the admin.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark"
          >
            Back to topics
          </Link>
        </div>
      </main>
    );
  }

  const closed = topic.status === "closed";

  const step: 1 | 2 | 3 = (() => {
    if (selected === null) return 1;
    if (!identifier.trim()) return 2;
    return 3;
  })();

  function castVote() {
    if (!topic) return;
    if (selected === null) {
      setError("Please select an option first.");
      return;
    }
    const value = identifier.trim();
    if (!value) {
      setError(`Please enter your ${idType}.`);
      return;
    }
    if (idType === "email" && !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (idType === "phone" && value.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    if (hasVoted(topic.id)) {
      setShowResults(true);
      return;
    }
    vote(topic.id, selected);
    setJustVoted(true);
    setShowResults(true);
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 4500);
  }

  const previewTotal = topic.votes.reduce((a, b) => a + b, 0);

  return (
    <main className="relative mx-auto max-w-[580px] px-6 pb-32 pt-10 sm:pb-10">
      <Confetti active={confetti} />
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition hover:text-primary"
      >
        ← All topics
      </button>

      {!showResults ? <Stepper step={step} /> : null}

      <div className="animate-rise-in rounded-2xl border border-line bg-white p-6 shadow-card">
        <span
          className={`mb-2.5 inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold tracking-wider ${
            closed
              ? "border-line bg-bg2 text-ink-muted"
              : "border-ok-border bg-ok-light text-ok"
          }`}
        >
          {closed ? "CLOSED" : "ACTIVE"}
        </span>
        <h1 className="text-[1.25rem] font-extrabold leading-tight">
          {topic.title}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
          {topic.desc}
        </p>

        {!showResults ? (
          <VoteForm
            options={topic.options}
            votes={topic.votes}
            previewTotal={previewTotal}
            selected={selected}
            onSelect={setSelected}
            idType={idType}
            onIdType={setIdType}
            identifier={identifier}
            onIdentifier={setIdentifier}
            error={error}
            onCast={castVote}
          />
        ) : (
          <ResultsView
            topic={topic}
            justVoted={justVoted}
            closed={closed}
            onBack={() => router.push("/")}
          />
        )}
      </div>

      {!showResults ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-6 py-3 backdrop-blur-md sm:hidden">
          <button
            type="button"
            onClick={castVote}
            className="w-full rounded-xl bg-primary py-3 text-[15px] font-bold text-white transition hover:bg-primary-dark disabled:opacity-50"
            disabled={selected === null || !identifier.trim()}
          >
            Cast My Vote
          </button>
        </div>
      ) : null}
    </main>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps: { label: string; n: 1 | 2 | 3 }[] = [
    { label: "Choose", n: 1 },
    { label: "Identify", n: 2 },
    { label: "Confirm", n: 3 },
  ];
  return (
    <ol
      aria-label="Steps"
      className="mb-4 flex items-center justify-center gap-2 text-[12px] font-semibold text-ink-soft"
    >
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <li key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition ${
                done
                  ? "border-primary bg-primary text-white"
                  : active
                    ? "border-primary text-primary"
                    : "border-line text-ink-soft"
              }`}
            >
              {done ? "✓" : s.n}
            </span>
            <span
              className={
                active || done ? "text-ink" : "text-ink-soft"
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={`mx-1 h-px w-6 ${done ? "bg-primary" : "bg-line"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function VoteSkeleton() {
  return (
    <main className="mx-auto max-w-[580px] px-6 py-10">
      <div className="h-4 w-24 rounded bg-line/60" />
      <div className="mt-6 h-44 rounded-2xl border border-line bg-white" />
    </main>
  );
}

function VoteForm({
  options,
  votes,
  previewTotal,
  selected,
  onSelect,
  idType,
  onIdType,
  identifier,
  onIdentifier,
  error,
  onCast,
}: {
  options: string[];
  votes: number[];
  previewTotal: number;
  selected: number | null;
  onSelect: (i: number) => void;
  idType: IdType;
  onIdType: (t: IdType) => void;
  identifier: string;
  onIdentifier: (v: string) => void;
  error: string;
  onCast: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="mb-5 flex flex-col gap-2.5">
        {options.map((label, i) => {
          const sel = selected === i;
          const pct =
            previewTotal > 0
              ? Math.round(((votes[i] ?? 0) / previewTotal) * 100)
              : 0;
          return (
            <button
              key={`${label}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={sel}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border-[1.5px] px-4 py-3 text-left transition ${
                sel
                  ? "border-primary bg-primary-light shadow-cardHover"
                  : "border-line bg-bg hover:border-primary-mid hover:bg-primary-light"
              }`}
            >
              <span
                className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  sel ? "border-primary bg-primary" : "border-line bg-white"
                }`}
              >
                {sel ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : null}
              </span>
              <span className="flex-1 text-[14px] font-medium text-ink">
                {label}
              </span>
              {previewTotal > 0 ? (
                <span className="flex-shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                  {pct}%
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mb-2.5 flex gap-2">
        <ToggleButton on={idType === "email"} onClick={() => onIdType("email")}>
          Email
        </ToggleButton>
        <ToggleButton on={idType === "phone"} onClick={() => onIdType("phone")}>
          Phone
        </ToggleButton>
      </div>

      <input
        className="mb-2.5 w-full rounded-xl border-[1.5px] border-line bg-bg px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
        type={idType === "email" ? "email" : "tel"}
        placeholder={
          idType === "email"
            ? "Enter your email address"
            : "Enter your phone number"
        }
        value={identifier}
        onChange={(e) => onIdentifier(e.target.value)}
        autoComplete={idType === "email" ? "email" : "tel"}
      />

      {error ? <p className="mb-2 text-[12px] text-bad">{error}</p> : null}

      <button
        type="button"
        onClick={onCast}
        className="hidden w-full rounded-xl bg-primary py-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-cardHover sm:block"
      >
        Cast My Vote
      </button>
    </div>
  );
}

function ToggleButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
        on
          ? "border-primary bg-primary-light text-primary"
          : "border-line text-ink-muted hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function ResultsView({
  topic,
  justVoted,
  closed,
  onBack,
}: {
  topic: { options: string[]; votes: number[] };
  justVoted: boolean;
  closed: boolean;
  onBack: () => void;
}) {
  const total = topic.votes.reduce((a, b) => a + b, 0);
  const max = Math.max(...topic.votes);

  return (
    <div className="mt-5 animate-fade-in">
      <div className="mb-5 rounded-xl border border-ok-border bg-ok-light px-3.5 py-2.5 text-[13px] font-semibold text-[#065F46]">
        {justVoted
          ? "Vote cast successfully! Here are the live results:"
          : closed
            ? "Results for this closed topic:"
            : "You already voted on this topic. Here are the current results:"}
      </div>

      <div>
        {topic.options.map((label, i) => {
          const count = topic.votes[i] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const win = count === max && total > 0;
          return (
            <div key={`${label}-${i}`} className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-ink">
                <span className="flex items-center gap-2">
                  {label}
                  {win ? (
                    <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Leading
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums text-primary">{pct}%</span>
              </div>
              <div className="h-[10px] overflow-hidden rounded-full bg-bg2">
                <div
                  className={`bar-anim h-full rounded-full ${
                    win
                      ? "bg-gradient-to-r from-primary to-accent"
                      : "bg-primary"
                  }`}
                  style={
                    {
                      "--w": `${pct}%`,
                      "--i": i,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-center text-[12px] text-ink-soft">
        <CountUp to={total} className="font-bold text-ink" /> total votes
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-cardHover"
      >
        ← Back to topics
      </button>
    </div>
  );
}
