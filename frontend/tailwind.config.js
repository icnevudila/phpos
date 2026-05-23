/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          "surface-soft": "var(--surface-soft)",
          "surface-muted": "var(--surface-muted)",
          border: "var(--border)",
          "border-strong": "var(--border-strong)",
          text: "var(--text)",
          "text-soft": "var(--text-soft)",
          muted: "var(--muted)",
          "muted-2": "var(--muted-2)",
          primary: "var(--primary)",
          "primary-hover": "var(--primary-hover)",
          "primary-soft": "var(--primary-soft)",
          success: "var(--success)",
          "success-soft": "var(--success-soft)",
          warning: "var(--warning)",
          "warning-soft": "var(--warning-soft)",
          danger: "var(--danger)",
          "danger-soft": "var(--danger-soft)",
          info: "var(--info)",
          "info-soft": "var(--info-soft)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'popover': 'var(--shadow-popover)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      }
    },
  },
  plugins: [],
};
