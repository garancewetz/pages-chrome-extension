import { useTheme, type Theme } from '../../lib/theme';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

const labelFor: Record<Theme, string> = {
  light: 'Activer le mode sombre',
  dark: 'Activer le mode clair',
};

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={labelFor[theme]}
      title={labelFor[theme]}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink-200 bg-white text-ink-500 transition-colors hover:border-violet-400 hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-violet-300 dark:hover:text-ink-50"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
