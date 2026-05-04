"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/confetti";
import { useTopics } from "@/components/topics-store";

type IdType = "email" | "phone";

export default function VotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const topicId = Number(params?.id);
  const { topics, hasVoted, vote } = useTopics();

  const topic = useMemo(
    () => topics.find((t) => t.id === topicId) ?? null,
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
      <main className="mx-auto max-w-[580px] px-6 py-10">
        <Link href="/" className="text-[13px] text-ink-soft hover:text-primary">
          ← All topics
        </Link>
        <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
          <h1 className="text-lg font-extrabold">Topic not found</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            This topic does not exist or was deleted by the admin.
          </p>
        </div>
      </main>
    );
  }

  const closed = topic.status === "closed";

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

  return (
    <main className="mx-auto max-w-[580px] px-6 py-10">
      <Confetti active={confetti} />
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition hover:text-primary"
      >
        ← All topics
      </button>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <span
          className={`mb-2.5 inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold tracking-wider ${
            closed
              ? "border-line bg-[#F3F4F6] text-ink-soft"
              : "border-ok-border bg-ok-light text-ok"
          }`}
        >
          {closed ? "CLOSED" : "ACTIVE"}
        </span>
        <h1 className="text-[1.2rem] font-extrabold leading-tight">{topic.title}</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{topic.desc}</p>

        {!showResults ? (
          <VoteForm
            options={topic.options}
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
    </main>
  );
}

function VoteForm({
  options,
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
          return (
            <button
              key={`${label}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-3.5 py-3 text-left transition ${
                sel
                  ? "border-primary bg-primary-light"
                  : "border-line bg-bg hover:border-primary-mid hover:bg-primary-light"
              }`}
            >
              <span
                className={`h-[17px] w-[17px] flex-shrink-0 rounded-full border-2 transition ${
                  sel ? "border-primary bg-primary" : "border-line bg-white"
                }`}
              />
              <span className="text-[14px] font-medium text-ink">{label}</span>
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
        className="mb-2.5 w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
        type={idType === "email" ? "email" : "tel"}
        placeholder={
          idType === "email" ? "Enter your email address" : "Enter your phone number"
        }
        value={identifier}
        onChange={(e) => onIdentifier(e.target.value)}
        autoComplete={idType === "email" ? "email" : "tel"}
      />

      {error ? <p className="mb-2 text-[12px] text-bad">{error}</p> : null}

      <button
        type="button"
        onClick={onCast}
        className="w-full rounded-[11px] bg-primary px-3 py-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
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
    <div className="mt-5">
      <div className="mb-4 rounded-[10px] border border-ok-border bg-ok-light px-3.5 py-2.5 text-[13px] font-semibold text-[#065F46]">
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
            <div key={`${label}-${i}`} className="mb-3">
              <div className="mb-1.5 flex justify-between text-[13px] font-semibold text-ink">
                <span>{label}</span>
                <span className="text-primary">{pct}%</span>
              </div>
              <div className="h-[9px] overflow-hidden rounded-full bg-bg2">
                <div
                  className={`h-full rounded-full transition-[width] duration-1000 ${
                    win ? "bg-gradient-to-r from-primary to-accent" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-center text-[12px] text-ink-soft">{total} total votes</p>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 w-full rounded-[11px] bg-primary px-3 py-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
      >
        ← Back to topics
      </button>
    </div>
  );
}
