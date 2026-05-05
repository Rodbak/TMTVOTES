"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  duration = 900,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const target = Math.max(0, Math.round(to));

  useEffect(() => {
    let raf = 0;
    startedAt.current = null;

    const tick = (t: number) => {
      if (startedAt.current === null) startedAt.current = t;
      const elapsed = t - startedAt.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {value.toLocaleString()}
    </span>
  );
}
