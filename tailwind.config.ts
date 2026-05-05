import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F7FF",
        bg2: "#EEF1FF",
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#EEF2FF",
          mid: "#818CF8",
        },
        accent: {
          DEFAULT: "#06B6D4",
          dark: "#0E7490",
          light: "#ECFEFF",
        },
        ok: { DEFAULT: "#059669", light: "#D1FAE5", border: "#A7F3D0" },
        bad: { DEFAULT: "#DC2626", light: "#FEE2E2", border: "#FECACA" },
        warn: { DEFAULT: "#D97706", light: "#FEF3C7", border: "#FDE68A" },
        ink: { DEFAULT: "#111827", muted: "#374151", soft: "#6B7280" },
        line: { DEFAULT: "#E5E7EB", primary: "#C7D2FE" },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.04)",
        cardHover:
          "0 1px 2px rgba(15,23,42,0.04), 0 12px 28px -12px rgba(79,70,229,0.28)",
        focus: "0 0 0 3px rgba(79,70,229,0.18)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        fall: {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(540deg)", opacity: "0" },
        },
        riseIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        toastIn: {
          "0%": { transform: "translate(-50%, 80px) scale(0.96)", opacity: "0" },
          "60%": { transform: "translate(-50%, -4px) scale(1.02)", opacity: "1" },
          "100%": { transform: "translate(-50%, 0) scale(1)", opacity: "1" },
        },
        blobDrift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(20px,-20px) scale(1.05)" },
        },
      },
      animation: {
        blink: "blink 1.8s infinite",
        fall: "fall 2.5s ease-in forwards",
        "rise-in": "riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.6s ease-out both",
        "toast-in": "toastIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "blob-drift": "blobDrift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
