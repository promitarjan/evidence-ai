/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        evidence: {
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          muted: "#64748b",
          green: "#10b981",
          greenLight: "#d1fae5",
          yellow: "#f59e0b",
          yellowLight: "#fef3c7",
          red: "#ef4444",
          redLight: "#fee2e2",
          resolved: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
