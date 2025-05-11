import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable class-based dark mode for next-themes
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Add other paths that contain Tailwind classes if necessary
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use Inter as the default sans font
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Use Tajawal for Arabic text
        tajawal: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        // Use Inter for monospace text
        mono: ["var(--font-inter)", "ui-monospace", "monospace"],
      },
      // Add custom theme extensions here
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // ... other extensions
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require('tailwindcss-motion')
    // Add other plugins here
  ],
};

export default config;
