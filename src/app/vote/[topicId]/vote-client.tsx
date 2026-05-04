"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Topic, Option } from "@prisma/client";
import { TopicStatus } from "@prisma/client";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type T = Topic & { options: Option[] };

function isOpenForVoting(topic: T): boolean {
  if (topic.status !== TopicStatus.ACTIVE) return false;
  const now = Date.now();
  if (topic.startDate && topic.startDate.getTime() > now) return false;
  if (topic.endDate && topic.endDate.getTime() < now) return false;
  return true;
}

export function VoteClient({ topic }: { topic: T }) {
  const router = useRouter();
  const open = useMemo(() => isOpenForVoting(topic), [topic]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [idType, setIdType] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  async function castVote() {
    if (!selected || !identifier.trim()) {
      toast.error("Choose an option and enter your email or phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic.id,
          optionId: selected,
          identifierType: idType,
          identifier,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.message("Already voted", {
          description: data.message || "You already voted on this topic.",
        });
        router.push(`/results/${topic.id}`);
        return;
      }
      if (!res.ok) {
        const err = data.error;
        const msg =
          typeof err === "string"
            ? err
            : err?.identifier?.[0] || "Could not record vote";
        toast.error(msg);
        setLoading(false);
        return;
      }
      const { default: confetti } = await import("canvas-confetti");
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 } });
      toast.success("Vote recorded!");
      router.push(`/results/${topic.id}`);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (topic.status !== TopicStatus.ACTIVE || !open) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Voting closed</h1>
          <p className="mt-4 text-tmt-muted">This topic is not accepting votes.</p>
          <Link href={`/results/${topic.id}`} className="btn-glow mt-8 inline-block">
            View results
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-sm text-tmt-cyan hover:underline">
          ← All topics
        </Link>
        <Stepper step={step} />
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 font-display text-3xl font-bold text-tmt-text"
        >
          {topic.title}
        </motion.h1>
        <p className="mt-3 text-tmt-muted">{topic.description}</p>

        <section className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-tmt-cyan">
            1 — Choose
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {topic.options.map((o) => {
              const active = selected === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSelected(o.id);
                    setStep(2);
                  }}
                  className={`option-card text-left ${active ? "option-card-selected" : ""}`}
                >
                  <span className="font-medium text-tmt-text">{o.optionText}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-tmt-purple">
            2 — Identify
          </h2>
          <div className="mt-4 flex gap-2 rounded-lg bg-tmt-surfaceMuted p-1">
            {(["EMAIL", "PHONE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setIdType(t)}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                  idType === t
                    ? "bg-tmt-cyan/20 text-tmt-cyan glow-border"
                    : "text-tmt-muted hover:text-tmt-text"
                }`}
              >
                {t === "EMAIL" ? "Email" : "Phone"}
              </button>
            ))}
          </div>
          <input
            type={idType === "EMAIL" ? "email" : "tel"}
            className="mt-4 w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3 text-tmt-text outline-none ring-tmt-cyan/30 focus:ring-2"
            placeholder={idType === "EMAIL" ? "you@example.com" : "+1 555 000 0000"}
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (step < 3) setStep(3);
            }}
          />
          <p className="mt-2 text-xs text-tmt-muted">
            We store a secure hash only — never your raw {idType === "EMAIL" ? "email" : "number"}{" "}
            in the database.
          </p>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            disabled={loading || !selected || !identifier.trim()}
            onClick={castVote}
            className="btn-glow min-w-[220px] animate-pulse-glow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Casting…" : "Cast My Vote"}
          </button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Choose", "Identify", "Confirm", "Results"];
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-tmt-muted">
      {labels.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
              i + 1 <= step
                ? "border-tmt-cyan bg-tmt-cyan/15 text-tmt-cyan"
                : "border-tmt-border bg-white/80"
            }`}
          >
            {i + 1}
          </span>
          {l}
          {i < labels.length - 1 ? <span className="px-1 text-tmt-muted/50">→</span> : null}
        </span>
      ))}
    </div>
  );
}
