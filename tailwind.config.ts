
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Chakra Petch", "sans-serif"],
        body: ["Athiti", "sans-serif"],
      },
      fontSize: {
        "heading-1": ["3.5rem", { lineHeight: "1.2" }],
        "heading-2": ["2.5rem", { lineHeight: "1.3" }],
        "heading-3": ["2rem", { lineHeight: "1.4" }],
        "heading-4": ["1.5rem", { lineHeight: "1.5" }],
        "body-large": ["1.25rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "body-small": ["0.875rem", { lineHeight: "1.6" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        brand: {
          gradient: {
            start: "#6c2a9b",
            middle: "#5d53ed",
            end: "#53ede5",
          },
        },
        background: "#1a1d2b",
        surface: "#242738",
        text: {
          primary: "#ffffff",
          secondary: "#94a3b8",
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(238deg, rgba(108, 42, 155, 1) 0%, rgba(93, 83, 237, 1) 50%, rgba(83, 237, 229, 1) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
