import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        coffee: "#3C2F2F",
        crema: "#DFAE74",
        roast: "#241A1A"
      },
      boxShadow: {
        card: "0 20px 40px -18px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
};

export default config;
