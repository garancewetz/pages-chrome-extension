import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Undo2, X } from 'lucide-react';

type ShowToastInput = {
  message: string;
  onUndo?: () => void;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 5000;

type ActiveToast = {
  id: number;
  message: string;
  onUndo?: () => void;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, []);

  const showToast = useCallback<ToastContextValue['showToast']>(
    ({ message, onUndo, durationMs = DEFAULT_DURATION_MS }) => {
      clearTimer();
      const id = Date.now() + Math.random();
      setToast({ id, message, onUndo });
      timer.current = setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
        timer.current = null;
      }, durationMs);
    },
    [],
  );

  useEffect(() => () => clearTimer(), []);

  const handleUndo = () => {
    toast?.onUndo?.();
    dismiss();
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-3 py-2 shadow-xl dark:border-ink-700 dark:bg-ink-800">
            <span className="px-1 text-base text-ink-800 dark:text-ink-50">
              {toast.message}
            </span>
            {toast.onUndo ? (
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-violet-600 px-3 text-base font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 dark:bg-violet-500 dark:hover:bg-violet-400"
              >
                <Undo2 size={16} aria-hidden />
                Annuler
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Fermer la notification"
              onClick={dismiss}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-ink-50"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
