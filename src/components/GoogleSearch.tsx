function GoogleG({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function GoogleSearch() {
  return (
    <form
      action="https://www.google.com/search"
      method="get"
      role="search"
      aria-label="Rechercher sur Google"
      className="mx-auto w-full max-w-2xl"
    >
      <label htmlFor="google-search-input" className="sr-only">
        Rechercher sur Google
      </label>
      <div className="group relative">
        {/* Halo de couleur sous l'input */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-violet-400/40 via-rose-400/30 to-sky-400/40 opacity-60 blur-2xl transition-opacity duration-500 group-focus-within:opacity-90 dark:from-violet-500/30 dark:via-rose-500/25 dark:to-sky-500/30"
        />
        <GoogleG className="pointer-events-none absolute left-6 top-1/2 z-10 h-7 w-7 -translate-y-1/2" />
        <input
          id="google-search-input"
          type="search"
          name="q"
          autoComplete="off"
          placeholder="Rechercher sur Google"
          className="relative w-full rounded-full border-2 border-ink-200 bg-white py-5 pl-16 pr-16 text-lg text-ink-900 placeholder:text-ink-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/30 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:placeholder:text-ink-400 dark:focus:border-violet-300"
        />
        <button
          type="submit"
          aria-label="Lancer la recherche"
          className="absolute right-2.5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-glow-violet transition hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/40"
        >
          <SearchIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}
