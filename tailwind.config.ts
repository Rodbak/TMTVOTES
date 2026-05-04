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
          light: "#ECFEFF",
        },
        ok: { DEFAULT: "#059669", light: "#D1FAE5", border: "#A7F3D0" },
        bad: { DEFAULT: "#DC2626", light: "#FEE2E2", border: "#FECACA" },
        warn: { DEFAULT: "#D97706", light: "#FEF3C7" },
        ink: { DEFAULT: "#111827", muted: "#4B5563", soft: "#9CA3AF" },
        line: { DEFAULT: "#E5E7EB", primary: "#C7D2FE" },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
        cardHover: "0 4px 16px rgba(79,70,229,0.12)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        fall: {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(540deg)", opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.8s infinite",
        fall: "fall 2.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};
export default config;
