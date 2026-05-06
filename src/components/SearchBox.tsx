import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  SEARCH_ENGINES,
  useSearchEngine,
  type SearchEngineConfig,
} from '../lib/searchEngines';

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

function EngineMark({
  engine,
  size,
}: {
  engine: SearchEngineConfig;
  /** Taille en pixels du carré contenant la marque. */
  size: number;
}) {
  if (engine.id === 'google') {
    return <GoogleG className="h-full w-full" />;
  }
  return (
    <span
      aria-hidden
      style={{ backgroundColor: engine.brandColor, width: size, height: size }}
      className="grid place-items-center rounded-full font-display text-xl font-bold text-white"
    >
      {engine.letter}
    </span>
  );
}

export function SearchBox() {
  const { engine, setEngineId } = useSearchEngine();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      SEARCH_ENGINES.findIndex((e) => e.id === engine.id),
    ),
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  // Synchronise l'option active sur le moteur courant à chaque ouverture,
  // pour qu'on retombe toujours sur la sélection en cours.
  useEffect(() => {
    if (!open) return;
    const idx = SEARCH_ENGINES.findIndex((e) => e.id === engine.id);
    if (idx >= 0) setActiveIndex(idx);
  }, [open, engine.id]);

  // Déplace le focus DOM sur l'option active quand le menu s'ouvre ou que
  // l'utilisateur navigue au clavier.
  useLayoutEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Fermeture sur clic extérieur, scroll de la fenêtre, ou redimensionnement.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onWindowKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onResize = () => setOpen(false);
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onWindowKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onWindowKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const commit = (id: SearchEngineConfig['id']) => {
    setEngineId(id);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % SEARCH_ENGINES.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + SEARCH_ENGINES.length) % SEARCH_ENGINES.length,
        );
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(SEARCH_ENGINES.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(SEARCH_ENGINES[activeIndex].id);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        // Laisse le navigateur déplacer le focus naturellement.
        setOpen(false);
        break;
    }
  };

  return (
    <form
      action={engine.searchUrl}
      method="get"
      role="search"
      aria-label={`Rechercher sur ${engine.name}`}
      className="mx-auto w-full max-w-2xl"
    >
      <label htmlFor="search-box-input" className="sr-only">
        Rechercher sur {engine.name}
      </label>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={`Moteur de recherche : ${engine.name}. Cliquez pour en choisir un autre.`}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onTriggerKeyDown}
          className="absolute left-2 top-1/2 z-10 flex h-12 -translate-y-1/2 items-center gap-1 rounded-full px-2 transition-colors hover:bg-violet-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/40 dark:hover:bg-violet-500/20"
        >
          <EngineMark engine={engine} size={28} />
          <ChevronDown
            size={16}
            aria-hidden
            className={`text-ink-600 transition-transform dark:text-ink-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        <input
          id="search-box-input"
          type="search"
          name={engine.paramName}
          autoComplete="off"
          placeholder={`Rechercher sur ${engine.name}`}
          className="relative w-full rounded-full border-2 border-ink-200 bg-white py-5 pl-20 pr-16 text-lg text-ink-900 placeholder:text-ink-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/30 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:placeholder:text-ink-400 dark:focus:border-violet-300"
        />

        <button
          type="submit"
          aria-label="Lancer la recherche"
          className="absolute right-2.5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-violet-500 text-white transition-colors hover:bg-violet-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/40 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          <SearchIcon className="h-6 w-6" />
        </button>

        {open ? (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Choisir un moteur de recherche"
            onKeyDown={onListKeyDown}
            className="absolute left-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-2 border-ink-200 bg-white p-1.5 shadow-xl dark:border-ink-700 dark:bg-ink-800"
          >
            {SEARCH_ENGINES.map((eng, i) => {
              const selected = eng.id === engine.id;
              return (
                <li
                  key={eng.id}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={selected}
                  tabIndex={i === activeIndex ? 0 : -1}
                  onClick={() => commit(eng.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base text-ink-700 outline-none transition-colors hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500/40 aria-selected:bg-violet-50 dark:text-ink-100 dark:hover:bg-violet-500/20 dark:aria-selected:bg-violet-500/20"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center">
                    <EngineMark engine={eng} size={28} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {eng.name}
                    </span>
                    <span className="block truncate text-sm text-ink-600 dark:text-ink-300">
                      {eng.description}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`grid h-6 w-6 shrink-0 place-items-center text-violet-700 dark:text-violet-200 ${
                      selected ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Check size={18} />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </form>
  );
}
