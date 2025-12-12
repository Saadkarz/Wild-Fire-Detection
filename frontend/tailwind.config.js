/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13ec5b",
        "primary-dark": "#00b359",
        "primary-dim": "#0e8a36",
        "background-light": "#f6f7f8",
        "background-dark": "#102216",
        "surface-dark": "#162e1e",
        "surface-darker": "#0b1810",
      },
      fontFamily: {
        "sans": ["Rajdhani", "sans-serif"],
        "display": ["Space Grotesk", "Orbitron", "sans-serif"],
        "mono": ["monospace"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
  plugins: [],
}
