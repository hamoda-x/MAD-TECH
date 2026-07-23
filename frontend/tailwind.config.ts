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
          green: "var(--mad-green)",
          card: "var(--mad-card)",
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
    },
  },
  plugins: [],
};

export default config;
