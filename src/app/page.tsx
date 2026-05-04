import type { Metadata } from "next";
import type { Topic, Option } from "@prisma/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TopicCard } from "@/components/topic-card";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { isDbConnectionError } from "@/lib/is-db-connection-error";
import {
  getActiveTopicsForHome,
  getClosedTopicsForHome,
} from "@/lib/public-queries";

export const metadata: Metadata = {
  title: { absolute: "TMT Votes | Your voice. Your vote." },
  description:
    "Public voting on live topics. Vote with email or phone. No accounts required.",
};

export const dynamic = "force-dynamic";

function voteSum(topics: (Topic & { options: Option[] })[]): number {
  return topics.reduce(
    (acc, t) => acc + t.options.reduce((s, o) => s + o.voteCount, 0),
    0,
  );
}

export default async function HomePage() {
  let active: Awaited<ReturnType<typeof getActiveTopicsForHome>>;
  let closed: Awaited<ReturnType<typeof getClosedTopicsForHome>>;
  try {
    [active, closed] = await Promise.all([
      getActiveTopicsForHome(),
      getClosedTopicsForHome(),
    ]);
  } catch (e) {
    if (isDbConnectionError(e)) {
      return (
        <>
          <SiteHeader />
          <DatabaseUnavailable />
          <SiteFooter />
        </>
      );
    }
    throw e;
  }

  const sortedActive = [...active].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  const featured = sortedActive.filter((t) => t.featured);
  const spotlight = featured.length > 0 && featured.length < sortedActive.length;
  const liveGrid = spotlight
    ? sortedActive.filter((t) => !t.featured)
    : sortedActive;

  const activeVotes = voteSum(active);
  const closedVotes = voteSum(closed);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-tmt-border/60 bg-gradient-to-br from-sky-200 via-white to-violet-100 px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-4 inline-block rounded-full border border-tmt-cyan/40 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-tmt-cyan shadow-sm">
              Public voting
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-tmt-text sm:text-5xl md:text-6xl">
              Your voice.{" "}
              <span className="text-tmt-cyan drop-shadow-sm">Your vote.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-tmt-muted">
              Bright ballots for events, town halls, and campaigns — voters use email or phone, no
              accounts. Organisers publish topics from a secure admin desk.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#live"
                className="btn-glow inline-flex min-w-[160px] items-center justify-center px-6 py-3 text-sm"
              >
                Jump to live votes
              </a>
              <a
                href="#archive"
                className="inline-flex min-w-[160px] items-center justify-center rounded-xl border-2 border-tmt-purple/40 bg-white/90 px-6 py-3 text-sm font-semibold text-tmt-purple shadow-sm transition hover:bg-white"
              >
                Browse archive
              </a>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-b border-tmt-border/40 bg-tmt-bg px-4 pb-12 pt-0">
          <div className="mx-auto -mt-10 max-w-6xl">
            <div className="grid gap-4 rounded-2xl border border-tmt-border/80 bg-white/95 p-6 shadow-lg backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-tmt-muted">
                  Live ballots
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-tmt-cyan tabular-nums">
                  {active.length}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-tmt-muted">
                  Votes on open topics
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-tmt-purple tabular-nums">
                  {activeVotes.toLocaleString()}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-tmt-muted">
                  Archived topics
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-tmt-text tabular-nums">
                  {closed.length}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-tmt-muted">
                  Votes in archive
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-tmt-muted tabular-nums">
                  {closedVotes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {spotlight ? (
          <section
            id="featured"
            className="border-b border-tmt-border/50 bg-gradient-to-r from-cyan-50/90 via-white to-violet-50/90 px-4 py-14"
          >
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-tmt-text sm:text-3xl">
                    Featured ballots
                  </h2>
                  <p className="mt-1 max-w-xl text-tmt-muted">
                    Highlighted by organisers — usually flagship votes or sponsor-visible topics.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {featured.map((t) => (
                  <TopicCard key={t.id} topic={t} variant="active" />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="live" className="scroll-mt-24 px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-tmt-text sm:text-3xl">
                  {spotlight ? "More open ballots" : "Open for voting"}
                </h2>
                <p className="mt-1 text-tmt-muted">
                  {spotlight
                    ? "Every other live topic — same flow: pick an option, confirm with email or phone."
                    : "Pick a card to vote. Counts update live after each ballot."}
                </p>
              </div>
            </div>
            {liveGrid.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-tmt-border bg-white/80 p-12 text-center text-tmt-muted">
                No active ballots right now. Check back soon.
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {liveGrid.map((t) => (
                  <TopicCard key={t.id} topic={t} variant="active" />
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="archive"
          className="scroll-mt-24 border-t border-tmt-border/60 bg-gradient-to-b from-tmt-surfaceMuted/80 to-tmt-bg px-4 py-16"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-bold text-tmt-text sm:text-3xl">
              Results archive
            </h2>
            <p className="mt-1 max-w-2xl text-tmt-muted">
              Closed topics stay visible for transparency — open any card to see final tallies and
              share links.
            </p>
            {closed.length === 0 ? (
              <p className="mt-8 text-tmt-muted">No closed topics yet.</p>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {closed.map((t) => (
                  <TopicCard key={t.id} topic={t} variant="closed" />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
