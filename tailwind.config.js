/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          bg: 'var(--accent-bg)',
          border: 'var(--accent-border)',
        },
        surface: 'var(--bg)',
        ink: 'var(--text-h)',
        muted: 'var(--text)',
        border: 'var(--border)',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
    },
  },
  plugins: [],
};
