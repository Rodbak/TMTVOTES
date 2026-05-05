type Size = "sm" | "md";

export function BrandGlyph({ size = "sm" }: { size?: Size }) {
  const dim = size === "md" ? 36 : 28;
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-card"
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim - 12}
        height={dim - 12}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 10.7l3.2 3.2L15.5 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandGlyph />
      <span className="text-[1.1rem] font-extrabold tracking-tight text-ink">
        TMT<span className="text-primary">Votes</span>
      </span>
    </span>
  );
}
