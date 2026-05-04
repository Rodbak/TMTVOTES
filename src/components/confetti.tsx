"use client";

import { useEffect, useState } from "react";

type Piece = {
  key: number;
  left: string;
  size: number;
  bg: string;
  round: boolean;
  delay: string;
  duration: string;
};

const COLOURS = ["#4F46E5", "#06B6D4", "#059669", "#D97706", "#EC4899", "#EF4444"];

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    const next: Piece[] = Array.from({ length: 55 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      size: 5 + Math.random() * 7,
      bg: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      round: Math.random() > 0.5,
      delay: `${Math.random() * 0.8}s`,
      duration: `${2 + Math.random() * 1.5}s`,
    }));
    setPieces(next);
    const id = window.setTimeout(() => setPieces([]), 4000);
    return () => window.clearTimeout(id);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="absolute animate-fall"
          style={{
            left: p.left,
            top: "-12px",
            width: p.size,
            height: p.size,
            background: p.bg,
            borderRadius: p.round ? "50%" : "3px",
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
