"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastState = { msg: string; tone: "default" | "error" } | null;

type Ctx = { toast: (msg: string, opts?: { error?: boolean }) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>(null);

  useEffect(() => {
    if (!state) return;
    const id = window.setTimeout(() => setState(null), 2800);
    return () => window.clearTimeout(id);
  }, [state]);

  const toast = useCallback((msg: string, opts?: { error?: boolean }) => {
    setState({ msg, tone: opts?.error ? "error" : "default" });
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className={`fixed left-1/2 bottom-5 z-[9999] -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-medium text-white shadow-card transition-transform duration-300 ${
          state ? "translate-y-0" : "translate-y-16"
        } ${state?.tone === "error" ? "bg-bad" : "bg-ink"}`}
      >
        {state?.msg ?? ""}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
