/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Light Theme
        'ds-bg': '#f4f4f5',      // zinc-100
        'ds-surface': '#ffffff',  // white
        'ds-accent': '#4f46e5',   // indigo-600
        'ds-text': '#18181b',     // zinc-900
        'ds-success': '#059669',   // emerald-600
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

