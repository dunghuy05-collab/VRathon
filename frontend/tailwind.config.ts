import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13251e",
        lime: "#cbf955",
        cream: "#f4f2e9",
        coral: "#ff6b4a",
      },
      boxShadow: { soft: "0 20px 60px rgba(19, 37, 30, 0.08)" },
    },
  },
  plugins: [],
} satisfies Config;

