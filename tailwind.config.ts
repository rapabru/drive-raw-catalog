import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#07080a",
          900: "#0d0f14",
          850: "#13161d",
          800: "#1a1e27",
          700: "#242936",
          600: "#32384a",
          500: "#49516a",
        },
        nikon: {
          yellow: "#FFE600",
          amber: "#FFB800",
          gold: "#D4A300",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
