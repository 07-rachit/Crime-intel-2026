/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#080C14",
        bg: "#080C14",
        panel: "#0F1626",
        panel2: "#141E33",
        line: "#1E2B45",
        ink: "#EDF2F7",
        muted: "#8A99B5",
        amber: "#F59E0B",
        "amber-hover": "#D97706",
        teal: "#14B8A6",
        cyan: "#06B6D4",
        crit: "#F43F5E",
        indigo: "#6366F1",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(20, 184, 166, 0.25)",
        "glow-amber": "0 0 20px -5px rgba(245, 158, 11, 0.25)",
        "glow-crit": "0 0 20px -5px rgba(244, 63, 94, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
