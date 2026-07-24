import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ethnocentric: ["var(--font-ethnocentric)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        mad: {
          bg: "var(--mad-bg)",
          surface: "var(--mad-surface)",
          border: "var(--mad-border)",
          accent: "var(--mad-accent)",
          "accent-light": "var(--mad-accent-light)",
          muted: "var(--mad-muted)",
          text: "var(--mad-text)",
          "text-primary": "var(--mad-text-primary)",
          "text-secondary": "var(--mad-text-secondary)",
          green: "var(--mad-green)",
          card: "var(--mad-card)",
          dark: "var(--mad-dark)",
          "dark-hover": "var(--mad-dark-hover)",
          purple: "var(--mad-purple)",
          cyan: "#00d4ff",
        },
      },
      spacing: {
        "start-4": "var(--tw-spacing, 1rem)",
        "end-4": "var(--tw-spacing, 1rem)",
        "start-6": "var(--tw-spacing, 1.5rem)",
        "end-6": "var(--tw-spacing, 1.5rem)",
      },
      inset: {
        "start-0": "0",
        "end-0": "0",
        "start-4": "1rem",
        "end-4": "1rem",
      },
      borderRadius: {
        "start-lg": "0.5rem",
        "end-lg": "0.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
