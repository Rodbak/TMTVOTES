"use client";

import { useEffect, useState } from "react";

export function Countdown({ end }: { end: Date }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = end.getTime() - now;
  if (ms <= 0) {
    return <span className="text-tmt-error">Ended</span>;
  }
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (d || h) parts.push(`${h}h`);
  parts.push(`${m}m`, `${sec}s`);
  return (
    <span className="font-mono text-tmt-cyan tabular-nums">
      {parts.join(" ")}
    </span>
  );
}
