import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tmt: {
          bg: "#E8F4FC",
          surface: "#FFFFFF",
          card: "#F1F7FC",
          surfaceMuted: "#D8EEF9",
          border: "#93C5E8",
          cyan: "#0091C7",
          purple: "#7C3AED",
          success: "#059669",
          error: "#DC2626",
          text: "#0B1220",
          muted: "#4A5F78",
        },
      },
      fontFamily: {
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(0,145,199,0.35)" },
          "50%": { boxShadow: "0 0 28px rgba(124,58,237,0.45)" },
        },
        barGrow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.2s ease-in-out infinite",
        "bar-grow": "barGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
