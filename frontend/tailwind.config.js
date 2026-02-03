/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#475569",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
        background: "#f8fafc",
        card: "#ffffff"
      }
    },
  },
  plugins: [],
}