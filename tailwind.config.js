/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#05070a',
          900: '#0a0d14',
          800: '#111724',
          700: '#1a2236',
        },
        kasEmerald: {
          DEFAULT: '#10b981',
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.3)',
        },
        kasRose: {
          DEFAULT: '#f43f5e',
          hover: '#e11d48',
          glow: 'rgba(244, 63, 94, 0.3)',
        },
        kasCyan: {
          DEFAULT: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
};
