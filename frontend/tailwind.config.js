/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // DentQL teal design system
        teal: {
          25:  "#f0fdfb",
          50:  "#e6f7f6",
          100: "#ccf0ed",
          200: "#99e1da",
          300: "#4ecdc4",
          400: "#2ab7ae",
          500: "#00a99d",
          600: "#008f84",
          700: "#00736a",
          800: "#005750",
          900: "#003b37",
        },
        brand: {
          bg:      "#e6f7f6",   // sidebar background
          active:  "#ccf0ed",   // active nav item bg
          accent:  "#00a99d",   // primary accent
          "accent-dark": "#008f84",
          text:    "#00736a",   // active nav text
          muted:   "#4b8d88",   // secondary text on sidebar
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
