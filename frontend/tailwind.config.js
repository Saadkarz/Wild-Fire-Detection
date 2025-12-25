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
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
        "surface-dark": "#1a2e22",
        "surface-lighter": "#243c2d",
        "accent-blue": "#3b82f6",
        "orange-brand": "#f97316",
        'cy-bg': '#020b0b',
        'cy-panel': '#051414',
        'cy-accent': '#00ff88',
        'cy-secondary': '#00ccff',
        'cy-danger': '#ff3333',
        'cy-dim': 'rgba(0, 255, 136, 0.1)',
        'cy-text-dim': '#a3d9c5',
      },
      fontFamily: {
        "sans": ["Noto Sans", "Inter", "sans-serif"],
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
        'cy-display': ['Orbitron', 'sans-serif'],
        'cy-body': ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        "glow": "0 0 20px -5px rgba(19, 236, 91, 0.3)",
        'neon': '0 0 10px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)',
        'neon-strong': '0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(0, 255, 136, 0.3)',
        'hologram': '0 0 30px rgba(0, 255, 136, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 255, 136, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.05) 1px, transparent 1px)",
        'scanline': "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))",
      },
      animation: {
        'spin-slow': 'spin 15s linear infinite',
        'spin-reverse': 'spin 20s linear infinite reverse',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'hologram-flicker': 'hologramFlicker 2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        hologramFlicker: {
          '0%, 100%': { opacity: '0.9' },
          '5%, 10%': { opacity: '0.7' },
          '15%': { opacity: '1' },
          '50%': { opacity: '0.9' },
          '55%': { opacity: '0.4' },
          '60%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
