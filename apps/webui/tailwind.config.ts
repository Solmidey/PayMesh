import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paymesh: {
          bg: "#0b0f1a",
          card: "#0f1729",
          accent: "#7c5cff",
          accent2: "#4cc9f0",
          success: "#22c55e",
          warn: "#f59e0b",
          text: "#E6EDF3"
        }
      },
      boxShadow: {
        smooth: "0 10px 30px rgba(0,0,0,.35)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
} satisfies Config;
