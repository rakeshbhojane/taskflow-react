/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f4',
          100: '#e0e0eb',
          200: '#c2c2d6',
          300: '#9191b8',
          400: '#6b6b99',
          500: '#4a4a7a',
          600: '#383863',
          700: '#27274d',
          800: '#181836',
          900: '#0c0c1f',
          950: '#06060f',
        },
        volt: {
          300: '#d4ff6e',
          400: '#c8ff4d',
          500: '#b8f400',
          600: '#9fd600',
        },
        coral: {
          400: '#ff6b6b',
          500: '#ff4757',
        },
        amber: {
          400: '#ffa502',
          500: '#ff9500',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
