import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sabana: {
          azul: "#003087",
          "azul-claro": "#0052CC",
          "azul-hover": "#003FA3",
          dorado: "#C8960C",
          "dorado-claro": "#F0B429",
          blanco: "#FFFFFF",
          gris: "#F8F9FA",
          "gris-oscuro": "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
