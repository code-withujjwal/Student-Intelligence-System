import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", ".dark"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#050816",
          secondary: "#0B1020",
          tertiary: "#111827",
        },
        primary: {
          DEFAULT: "#6366F1",
          hover: "#7C3AED",
          glow: "rgba(99,102,241,0.4)",
        },
        accent: {
          indigo: "#6366F1",
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          violet: "#7C3AED",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.07)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        heading: ["Syne", "Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.25), rgba(5,8,22,0))",
        "glow-indigo": "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        "glow-purple": "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
        "glow-cyan": "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
        "mesh-gradient": "linear-gradient(135deg, #050816 0%, #0B1020 50%, #050816 100%)",
        "shine-gradient": "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(99,102,241,0.35)",
        "glow-md": "0 0 35px rgba(99,102,241,0.35)",
        "glow-lg": "0 0 70px rgba(99,102,241,0.35)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.3)",
        "glow-purple": "0 0 30px rgba(139,92,246,0.3)",
        "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-hover": "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "card": "0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-x": "float-x 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "particle": "particle 20s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "spin-med": "spin 5s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "shine": "shine 4s linear infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 0.5s ease",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "scan": "scan-line 4s linear infinite",
        "data-pulse": "data-pulse 1.2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-x": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-12px) translateX(8px)" },
          "66%": { transform: "translateY(6px) translateX(-5px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 60px rgba(99,102,241,0.7), 0 0 100px rgba(99,102,241,0.25)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "particle": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) rotate(720deg)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shine": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(99,102,241,0.3)" },
          "50%": { borderColor: "rgba(99,102,241,0.8)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "data-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scaleY(0.6)" },
          "50%": { opacity: "1", transform: "scaleY(1)" },
        },
        "fadeInUp": {
          "from": { opacity: "0", transform: "translateY(24px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
} satisfies Config;
