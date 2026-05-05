"use client";

import { useMemo, useState } from "react";
import { useTopics } from "@/components/topics-store";
import { useToast } from "@/components/toast";
import { Sparkline } from "@/components/sparkline";
import { CountUp } from "@/components/count-up";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BrandGlyph } from "@/components/brand-glyph";

export default function AdminPage() {
  const { loggedIn } = useTopics();
  return (
    <main className="mx-auto max-w-[820px] px-6 py-8">
      {loggedIn ? <Dashboard /> : <Login />}
    </main>
  );
}

function Login() {
  const { login } = useTopics();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!login(username, password)) {
      setError("Incorrect credentials. Try: admin / tmt2024");
      return;
    }
    setError("");
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-[400px] animate-rise-in rounded-2xl border border-line bg-white p-8 shadow-card">
      <div className="mb-5 flex items-center gap-2">
        <BrandGlyph size="md" />
        <span className="text-[1.1rem] font-extrabold tracking-tight text-ink">
          TMT<span className="text-primary">Votes</span>
        </span>
      </div>
      <h2 className="text-[1.25rem] font-extrabold">Admin login</h2>
      <p className="mt-1 mb-6 text-[13px] text-ink-muted">
        Restricted to administrators only.
      </p>

      <Field label="USERNAME">
        <input
          className="w-full rounded-xl border-[1.5px] border-line bg-bg px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </Field>

      <Field label="PASSWORD">
        <input
          className="w-full rounded-xl border-[1.5px] border-line bg-bg px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </Field>

      {error ? <p className="mb-2 text-[12px] text-bad">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        className="mt-2 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-white transition hover:bg-primary-dark"
      >
        Login to dashboard
      </button>

      <p className="mt-3 text-center text-[11px] text-ink-soft">
        Demo: admin / tmt2024
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}

function Dashboard() {
  const { topics, toggleStatus, removeTopic, logout } = useTopics();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">(
    "all",
  );
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const stats = useMemo(() => {
    const total = topics.reduce(
      (acc, t) => acc + t.votes.reduce((a, b) => a + b, 0),
      0,
    );
    const active = topics.filter((t) => t.status === "active").length;
    return { total, active, count: topics.length };
  }, [topics]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.options.some((o) => o.toLowerCase().includes(q))
      );
    });
  }, [topics, query, statusFilter]);

  return (
    <div className="animate-rise-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[1.4rem] font-extrabold text-ink">Dashboard</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Manage all voting topics
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            toast("Signed out");
          }}
          className="rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-muted transition hover:border-bad hover:text-bad"
        >
          Logout
        </button>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Total topics" value={stats.count} tone="ink" />
        <Stat label="Total votes" value={stats.total} tone="primary" />
        <Stat label="Active topics" value={stats.active} tone="ok" />
      </div>

      {showCreate ? <CreatePanel onDone={() => setShowCreate(false)} /> : null}

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">
          All topics
        </span>
        <button
          type="button"
          onClick={() => setShowCreate((s) => !s)}
          className="rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark"
        >
          {showCreate ? "Close" : "+ New topic"}
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search topics, descriptions, options..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2 text-[13px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary"
        />
        <div className="flex gap-1.5 rounded-full bg-white p-1 ring-1 ring-line">
          {(["all", "active", "closed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize transition ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "text-ink-muted hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-[13px] text-ink-soft">
            No topics match your filter.
          </div>
        ) : (
          filtered.map((t, i) => {
            const tv = t.votes.reduce((a, b) => a + b, 0);
            const isActive = t.status === "active";
            return (
              <div
                key={t.id}
                className="flex animate-rise-in flex-col gap-3 rounded-xl border border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    <span className="tabular-nums">{tv}</span> votes ·{" "}
                    {t.options.length} options ·{" "}
                    <span className={isActive ? "text-ok" : "text-ink-soft"}>
                      {t.status}
                    </span>
                  </p>
                  <Sparkline values={t.votes} className="mt-2" />
                </div>
                <div className="flex flex-shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      toggleStatus(t.id);
                      toast(
                        `Topic ${isActive ? "closed" : "opened"}`,
                      );
                    }}
                    className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                      isActive
                        ? "border-bad-border text-bad hover:bg-bad-light"
                        : "border-ok-border text-ok hover:bg-ok-light"
                    }`}
                  >
                    {isActive ? "Close" : "Open"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingDelete({ id: t.id, title: t.title })
                    }
                    className="rounded-full border border-line px-3 py-1 text-[12px] font-medium text-ink-soft transition hover:border-bad hover:text-bad"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete topic?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed permanently. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeTopic(pendingDelete.id);
            toast("Topic deleted");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ink" | "primary" | "ok";
}) {
  const colour =
    tone === "primary"
      ? "text-primary"
      : tone === "ok"
        ? "text-ok"
        : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 text-center shadow-card">
      <CountUp
        to={value}
        className={`block text-[2rem] font-extrabold leading-none ${colour}`}
      />
      <p className="mt-1 text-[11px] font-semibold tracking-wide text-ink-soft">
        {label}
      </p>
    </div>
  );
}

function CreatePanel({ onDone }: { onDone: () => void }) {
  const { createTopic } = useTopics();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  function setOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }
  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }
  function removeOption(index: number) {
    setOptions((prev) =>
      prev.length <= 2 ? prev : prev.filter((_, i) => i !== index),
    );
  }

  function submit() {
    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!trimmedTitle) {
      toast("Please enter a title", { error: true });
      return;
    }
    if (trimmedOptions.length < 2) {
      toast("Add at least 2 options", { error: true });
      return;
    }
    createTopic(trimmedTitle, desc.trim(), trimmedOptions);
    setTitle("");
    setDesc("");
    setOptions(["", ""]);
    toast("Topic created!");
    onDone();
  }

  return (
    <div className="mb-5 animate-rise-in rounded-2xl border-[1.5px] border-line-primary bg-primary-light p-5">
      <h3 className="mb-4 text-[14px] font-bold text-primary">
        Create new topic
      </h3>

      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        TITLE
      </label>
      <input
        className="mb-3 w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary"
        placeholder="e.g. Best city to live in Africa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        DESCRIPTION
      </label>
      <textarea
        className="mb-3 w-full resize-y rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary"
        rows={2}
        placeholder="Short description..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        OPTIONS
      </label>
      <div>
        {options.map((value, i) => (
          <div key={i} className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary"
              placeholder={`Option ${i + 1}`}
              value={value}
              onChange={(e) => setOption(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              disabled={options.length <= 2}
              aria-label={`Remove option ${i + 1}`}
              className="px-1.5 text-[18px] text-ink-soft transition hover:text-bad disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="mt-2 w-full rounded-xl border-[1.5px] border-dashed border-line-primary bg-transparent py-2.5 text-[13px] font-semibold text-primary transition hover:bg-white"
      >
        + Add option
      </button>

      <button
        type="button"
        onClick={submit}
        className="mt-3 w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-white transition hover:bg-primary-dark"
      >
        Create topic
      </button>
    </div>
  );
}
