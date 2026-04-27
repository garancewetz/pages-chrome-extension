/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI Variable',
          'Segoe UI',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI Variable',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        // Échelle pensée pour public post-AVC : base 1.0625rem (17px)
        '2xs': ['0.8125rem', { lineHeight: '1.25rem' }],
        xs: ['0.875rem', { lineHeight: '1.35rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1.0625rem', { lineHeight: '1.55rem' }],
        lg: ['1.1875rem', { lineHeight: '1.6rem' }],
        xl: ['1.375rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.625rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.4rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.9rem' }],
      },
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#eceef5',
          200: '#d6dae8',
          300: '#aab1c8',
          400: '#7f88a6',
          500: '#5b6483',
          600: '#444c69',
          700: '#323852',
          800: '#1d2138',
          900: '#0e1023',
          950: '#070818',
        },
        violet: {
          glow: '#8b5cf6',
          deep: '#6d28d9',
        },
        rose: {
          glow: '#fb7185',
          deep: '#e11d48',
        },
        sky: {
          glow: '#38bdf8',
          deep: '#0284c7',
        },
        amber: {
          glow: '#fbbf24',
        },
      },
      boxShadow: {
        glass:
          '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 8px 32px -12px rgba(15,23,42,0.18)',
        'glass-lg':
          '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 20px 60px -20px rgba(15,23,42,0.25)',
        'glow-violet': '0 12px 40px -12px rgba(139,92,246,0.45)',
        'glow-sky': '0 12px 40px -12px rgba(56,189,248,0.4)',
        'glow-amber': '0 12px 40px -12px rgba(251,191,36,0.35)',
      },
      backdropBlur: {
        glass: '20px',
        xs: '6px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'blob-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -3%, 0) scale(1.05)' },
          '66%': { transform: 'translate3d(-3%, 4%, 0) scale(0.97)' },
        },
      },
      animation: {
        'blob-drift': 'blob-drift 22s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
