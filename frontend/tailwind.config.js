/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F6F2E9",
        ink: "#241F1A",
        forest: {
          50: "#EAF1EE",
          100: "#CBDDD5",
          400: "#3C7A64",
          500: "#2C6350",
          600: "#204A3C",
          700: "#173729",
        },
        brass: {
          100: "#F1E1BE",
          400: "#C6963C",
          500: "#AD7E2C",
          600: "#8A6420",
        },
        clay: {
          500: "#B3452F",
          600: "#943827",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
