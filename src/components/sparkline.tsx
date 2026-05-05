/** Tiny CSS-only stacked bar showing relative vote share. */
export function Sparkline({
  values,
  className = "",
}: {
  values: number[];
  className?: string;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  const palette = [
    "#4F46E5",
    "#06B6D4",
    "#7C3AED",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
  ];

  if (total === 0) {
    return (
      <div
        className={`h-1.5 w-full rounded-full bg-line ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`flex h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}
      aria-hidden
    >
      {values.map((v, i) => {
        const pct = (v / total) * 100;
        if (pct === 0) return null;
        return (
          <span
            key={i}
            style={{
              width: `${pct}%`,
              background: palette[i % palette.length],
            }}
          />
        );
      })}
    </div>
  );
}
