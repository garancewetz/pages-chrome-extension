import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ConfirmInput = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (input: ConfirmInput) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

type ActiveConfirm = ConfirmInput & {
  resolve: (ok: boolean) => void;
};

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveConfirm | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmContextValue['confirm']>((input) => {
    return new Promise<boolean>((resolve) => {
      setActive({ ...input, resolve });
    });
  }, []);

  // Met le focus sur « Non » à l'ouverture : pour une utilisatrice post-AVC
  // qui ouvre la boîte par erreur, Entrée ne supprime jamais — il annule.
  useEffect(() => {
    if (active) cancelRef.current?.focus();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        active.resolve(false);
        setActive(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  const handleConfirm = () => {
    active?.resolve(true);
    setActive(null);
  };

  const handleCancel = () => {
    active?.resolve(false);
    setActive(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby={
            active.description ? 'confirm-dialog-desc' : undefined
          }
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
        >
          <div
            aria-hidden
            onClick={handleCancel}
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm dark:bg-black/70"
          />
          <div className="relative w-full max-w-md rounded-2xl border-2 border-ink-200 bg-white p-5 shadow-2xl dark:border-ink-700 dark:bg-ink-800">
            <h2
              id="confirm-dialog-title"
              className="font-display text-xl font-bold text-ink-800 dark:text-ink-50"
            >
              {active.title}
            </h2>
            {active.description ? (
              <p
                id="confirm-dialog-desc"
                className="mt-3 text-base text-ink-700 dark:text-ink-100"
              >
                {active.description}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={handleCancel}
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-ink-300 bg-white px-5 text-base font-semibold text-ink-800 transition-colors hover:bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 dark:border-ink-600 dark:bg-ink-700 dark:text-ink-50 dark:hover:bg-ink-600"
              >
                {active.cancelLabel ?? 'Non, garder'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={
                  active.danger
                    ? 'inline-flex h-12 items-center justify-center rounded-lg bg-rose-600 px-5 text-base font-bold text-white transition-colors hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:bg-rose-500 dark:hover:bg-rose-400'
                    : 'inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-5 text-base font-bold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 dark:bg-violet-500 dark:hover:bg-violet-400'
                }
              >
                {active.confirmLabel ?? 'Oui'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx)
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return ctx;
}
