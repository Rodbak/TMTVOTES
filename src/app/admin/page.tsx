"use client";

import { useMemo, useState } from "react";
import { useTopics } from "@/components/topics-store";
import { useToast } from "@/components/toast";

export default function AdminPage() {
  const { loggedIn } = useTopics();
  return (
    <main className="mx-auto max-w-[780px] px-6 py-6">
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
    <div className="mx-auto mt-12 w-full max-w-[380px] rounded-[18px] border border-line bg-white p-8 shadow-card">
      <p className="mb-4 text-[1.1rem] font-extrabold tracking-tight text-ink">
        TMT<span className="text-primary">Votes</span>
      </p>
      <h2 className="text-[1.25rem] font-extrabold">Admin login</h2>
      <p className="mt-1 mb-6 text-[13px] text-ink-muted">
        Restricted to administrators only
      </p>

      <Field label="USERNAME">
        <input
          className="w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </Field>

      <Field label="PASSWORD">
        <input
          className="w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
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
        className="mt-2 w-full rounded-[10px] bg-primary px-3 py-3 text-[14px] font-bold text-white transition hover:bg-primary-dark"
      >
        Login to dashboard
      </button>

      <p className="mt-2.5 text-center text-[11px] text-ink-soft">
        Demo: admin / tmt2024
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

  const stats = useMemo(() => {
    const total = topics.reduce(
      (acc, t) => acc + t.votes.reduce((a, b) => a + b, 0),
      0,
    );
    const active = topics.filter((t) => t.status === "active").length;
    return { total, active, count: topics.length };
  }, [topics]);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[1.2rem] font-extrabold text-ink">Dashboard</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">Manage all voting topics</p>
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

      <div className="mb-6 grid grid-cols-3 gap-2.5">
        <Stat label="Total topics" value={stats.count} />
        <Stat label="Total votes" value={stats.total} />
        <Stat label="Active topics" value={stats.active} />
      </div>

      {showCreate ? <CreatePanel onDone={() => setShowCreate(false)} /> : null}

      <div className="mb-2.5 flex items-center justify-between">
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

      <div className="flex flex-col gap-2.5">
        {topics.map((t) => {
          const tv = t.votes.reduce((a, b) => a + b, 0);
          const isActive = t.status === "active";
          return (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{t.title}</p>
                <p className="text-[12px] text-ink-soft">
                  {tv} votes · {t.options.length} options ·{" "}
                  <span className={isActive ? "text-ok" : "text-ink-soft"}>
                    {t.status}
                  </span>
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    toggleStatus(t.id);
                    toast(`Topic ${isActive ? "closed" : "opened"}`);
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
                  onClick={() => {
                    removeTopic(t.id);
                    toast("Topic deleted");
                  }}
                  className="rounded-full border border-line px-3 py-1 text-[12px] font-medium text-ink-soft transition hover:border-bad hover:text-bad"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 text-center">
      <p className="text-[2rem] font-extrabold leading-none text-primary">{value}</p>
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
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
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
    <div className="mb-5 rounded-[14px] border-[1.5px] border-line-primary bg-primary-light p-5">
      <h3 className="mb-4 text-[14px] font-bold text-primary">Create new topic</h3>

      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        TITLE
      </label>
      <input
        className="mb-2.5 w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
        placeholder="e.g. Best city to live in Africa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-soft">
        DESCRIPTION
      </label>
      <textarea
        className="mb-2.5 w-full resize-y rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
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
              className="flex-1 rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-primary focus:bg-white"
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
        className="mt-2 w-full rounded-[9px] border-[1.5px] border-dashed border-line-primary bg-transparent py-2.5 text-[13px] font-semibold text-primary transition hover:bg-white"
      >
        + Add option
      </button>

      <button
        type="button"
        onClick={submit}
        className="mt-2.5 w-full rounded-[9px] bg-primary py-3 text-[13px] font-bold text-white transition hover:bg-primary-dark"
      >
        Create topic
      </button>
    </div>
  );
}
