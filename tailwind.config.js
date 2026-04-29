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
        xs: ['0.875rem', { lineHeight: '1.35rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1.0625rem', { lineHeight: '1.55rem' }],
        lg: ['1.1875rem', { lineHeight: '1.6rem' }],
        xl: ['1.375rem', { lineHeight: '1.75rem' }],
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
      },
    },
  },
  plugins: [],
};
