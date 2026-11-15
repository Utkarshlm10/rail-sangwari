import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          navy: "#0B2545",
          navyDark: "#061528",
          navyLight: "#133E6E",
          gold: "#F59E0B",
          goldLight: "#FDE68A",
          goldDark: "#D97706",
          red: "#C81E1E",
          redHover: "#A51616",
          redSoft: "#FEE2E2",
          surface: "#F5F5F7",
          card: "#FFFFFF",
          textMain: "#1D1D1F",
          textMuted: "#86868B",
          border: "rgba(0, 0, 0, 0.06)",
          // Apple & 21st.dev Neutral Dark Tokens
          darkSurface: "#09090B",
          darkCard: "#18181B",
          darkCardHover: "#27272A",
          darkCardElevated: "#27272A",
          darkBorder: "rgba(255, 255, 255, 0.08)",
          darkTextMain: "#F4F4F5",
          darkTextMuted: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 8px 30px rgba(0, 0, 0, 0.04)",
        appleElevated: "0 14px 44px rgba(0, 0, 0, 0.08)",
        appleHover: "0 20px 48px rgba(0, 0, 0, 0.12)",
        glowGold: "0 0 20px rgba(245, 158, 11, 0.35)",
        glowRed: "0 0 24px rgba(200, 30, 30, 0.35)",
        darkCard: "0 12px 40px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
