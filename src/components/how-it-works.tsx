type Step = { n: string; title: string; desc: string };

const STEPS: Step[] = [
  {
    n: "1",
    title: "Pick a topic",
    desc: "Browse open ballots and tap one that catches your eye.",
  },
  {
    n: "2",
    title: "Identify yourself",
    desc: "Use your email or phone — no account or password to set up.",
  },
  {
    n: "3",
    title: "See live results",
    desc: "Your vote is counted instantly and the bars update in real time.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto mt-2 max-w-[860px] scroll-mt-20 px-6 py-10"
    >
      <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">
        <span>How it works</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="stagger grid gap-3.5 sm:grid-cols-3" style={{ "--stagger-step": "70ms" } as React.CSSProperties}>
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="rounded-2xl border border-line bg-white p-5 shadow-card"
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-[14px] font-extrabold text-white">
              {step.n}
            </div>
            <h3 className="text-[15px] font-bold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
