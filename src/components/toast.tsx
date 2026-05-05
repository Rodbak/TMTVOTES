"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastState = { msg: string; tone: "default" | "error"; key: number } | null;

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
    setState({ msg, tone: opts?.error ? "error" : "default", key: Date.now() });
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {state ? (
        <div
          aria-live="polite"
          key={state.key}
          className={`fixed left-1/2 bottom-6 z-[9999] flex animate-toast-in items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-medium text-white shadow-cardHover ${
            state.tone === "error" ? "bg-bad" : "bg-ink"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${
              state.tone === "error" ? "bg-white" : "bg-accent"
            }`}
          />
          {state.msg}
        </div>
      ) : null}
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
