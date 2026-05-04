"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }
      toast.success("Welcome back");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tmt-bg px-4">
      <div className="glass w-full max-w-md p-8 glow-border-purple">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 font-display text-xl font-bold text-tmt-cyan">
            T
          </div>
          <h1 className="font-display text-2xl font-bold text-tmt-text">TMT Votes</h1>
          <p className="mt-1 text-sm text-tmt-muted">Admin sign-in</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-tmt-muted">
              Username
            </label>
            <input
              className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3 text-tmt-text outline-none ring-tmt-cyan/30 focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-tmt-muted">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border-2 border-tmt-border bg-white px-4 py-3 text-tmt-text outline-none ring-tmt-cyan/30 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-3 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Secure login"}
          </button>
        </form>
      </div>
    </div>
  );
}
