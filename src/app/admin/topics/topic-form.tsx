"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Topic, Option, TopicStatus } from "@prisma/client";
import { toast } from "sonner";

type T = Topic & { options: Option[] };

export function TopicForm({
  mode,
  initial,
}: {
  mode: "new" | "edit";
  initial?: T;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TopicStatus>(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [startDate, setStartDate] = useState(
    initial?.startDate ? toLocalInput(initial.startDate) : "",
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ? toLocalInput(initial.endDate) : "",
  );
  const [opts, setOpts] = useState<string[]>(
    initial?.options.map((o) => o.optionText) ?? ["Option A", "Option B"],
  );
  const [loading, setLoading] = useState(false);

  function addOption() {
    setOpts((o) => [...o, `Option ${o.length + 1}`]);
  }
  function removeOption(i: number) {
    setOpts((o) => o.filter((_, j) => j !== i));
  }
  function setOpt(i: number, v: string) {
    setOpts((o) => o.map((x, j) => (j === i ? v : x)));
  }

  async function save() {
    const options = opts.map((s) => s.trim()).filter(Boolean);
    if (options.length < 2) {
      toast.error("At least two options are required.");
      return;
    }
    setLoading(true);
    const body = {
      title: title.trim(),
      description: description.trim(),
      status,
      featured,
      startDate: startDate || null,
      endDate: endDate || null,
      options,
    };
    try {
      const url =
        mode === "new" ? "/api/admin/topics" : `/api/admin/topics/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Save failed");
        console.error(data);
        setLoading(false);
        return;
      }
      toast.success("Saved");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-tmt-text">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-tmt-muted">Title</label>
        <input
          className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3 outline-none ring-tmt-cyan/30 focus:ring-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-tmt-muted">
          Description
        </label>
        <textarea
          rows={5}
          className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3 outline-none ring-tmt-cyan/30 focus:ring-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-tmt-muted">
            Start (optional)
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-tmt-muted">
            End (optional)
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-tmt-muted">
            Status
          </label>
          <select
            className="rounded-xl border-2 border-tmt-border bg-white px-4 py-3"
            value={status}
            onChange={(e) => setStatus(e.target.value as TopicStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pt-8 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured / pinned on homepage
        </label>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase text-tmt-muted">Options</label>
          <button type="button" onClick={addOption} className="text-xs text-tmt-cyan hover:underline">
            Add option
          </button>
        </div>
        <div className="space-y-2">
          {opts.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 rounded-xl border-2 border-tmt-border bg-white px-4 py-2"
                value={o}
                onChange={(e) => setOpt(i, e.target.value)}
              />
              {opts.length > 2 ? (
                <button
                  type="button"
                  className="text-tmt-error"
                  onClick={() => removeOption(i)}
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" disabled={loading} onClick={save} className="btn-glow px-6 py-3">
          {loading ? "Saving…" : "Save topic"}
        </button>
        <button
          type="button"
          className="rounded-xl border-2 border-tmt-border bg-white/90 px-6 py-3 text-tmt-muted"
          onClick={() => router.push("/admin/dashboard")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}
