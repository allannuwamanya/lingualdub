/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070b14',
          card: '#0c1220',
          surface: '#11192c',
          border: '#1e293b',
          muted: '#334155',
        },
        surface: {
          base: '#070b14',
          card: '#0c1220',
          overlay: '#11192c',
          hover: '#17223b',
          active: '#1e2d4f',
        },
        ui: {
          border: 'rgba(255, 255, 255, 0.07)',
          borderHover: 'rgba(255, 255, 255, 0.14)',
          borderFocus: '#6366f1',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172554',
          950: '#081028',
        },
        daw: {
          indigo: '#6366f1',
          emerald: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
        }
      },
      boxShadow: {
        'daw': '0 4px 24px -2px rgba(0, 0, 0, 0.6), 0 2px 8px -2px rgba(0, 0, 0, 0.4)',
        'dock': '0 -8px 32px 0 rgba(0, 0, 0, 0.75)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
        'glow-indigo': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        'wave': 'waveform 1.6s ease-in-out infinite',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.25)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
