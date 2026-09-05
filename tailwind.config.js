/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Outfit"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          "Inter",
          '"Segoe UI"',
          "Roboto",
          "sans-serif"
        ],
        display: [
          '"Outfit"',
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif"
        ],
      },
      colors: {
        ios: {
          bg: '#F2F2F7',
          card: 'rgba(255, 255, 255, 0.85)',
          separator: 'rgba(60, 60, 67, 0.12)',
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#5AC8FA',
          yellow: '#FFCC00',
        },
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
      },
      boxShadow: {
        'ios-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'ios': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'ios-lg': '0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'ios-float': '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'ios-sm': '12px',
        'ios': '18px',
        'ios-lg': '24px',
        'ios-xl': '32px',
      }
    },
  },
  plugins: [],
};
