import { useEffect, useRef } from 'react';
import { Folder, Globe, RotateCcw, X } from 'lucide-react';
import type { DeletionEntry, DeletionHistoryApi } from './useDeletionHistory';

type Props = {
  open: boolean;
  onClose: () => void;
  history: DeletionHistoryApi;
  onRestore: (entry: DeletionEntry) => void;
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

function describeEntry(entry: DeletionEntry): string {
  if (entry.kind === 'bookmark') {
    return entry.snapshot.title || entry.snapshot.url || 'Favori';
  }
  const count = entry.snapshot.items.length;
  if (count === 0) return `Groupe « ${entry.snapshot.name} »`;
  if (count === 1) return `Groupe « ${entry.snapshot.name} » (1 favori)`;
  return `Groupe « ${entry.snapshot.name} » (${count} favoris)`;
}

export function HistoryPanel({ open, onClose, history, onRestore }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-panel-title"
      className="fixed inset-0 z-[85] flex items-center justify-center px-4"
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm dark:bg-black/70"
      />
      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-ink-200 bg-white shadow-2xl dark:border-ink-700 dark:bg-ink-800">
        <header className="flex items-center justify-between gap-3 border-b-2 border-ink-200 px-5 py-4 dark:border-ink-700">
          <div>
            <h2
              id="history-panel-title"
              className="font-display text-xl font-bold text-ink-800 dark:text-ink-50"
            >
              Historique des suppressions
            </h2>
            <p className="mt-1 text-base text-ink-600 dark:text-ink-200">
              Pour récupérer un favori ou un groupe supprimé.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Fermer l'historique"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-ink-50"
          >
            <X size={22} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {history.entries.length === 0 ? (
            <p className="py-8 text-center text-base text-ink-600 dark:text-ink-200">
              Aucune suppression à restaurer.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 dark:border-ink-700 dark:bg-ink-700/40"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-200">
                    {entry.kind === 'group' ? (
                      <Folder size={18} aria-hidden />
                    ) : (
                      <Globe size={18} aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-ink-800 dark:text-ink-50">
                      {describeEntry(entry)}
                    </p>
                    <p className="text-sm text-ink-600 dark:text-ink-200">
                      Supprimé le {dateFmt.format(entry.deletedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestore(entry)}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-3.5 text-base font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 dark:bg-violet-500 dark:hover:bg-violet-400"
                  >
                    <RotateCcw size={16} aria-hidden />
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {history.entries.length > 0 ? (
          <footer className="flex items-center justify-end border-t-2 border-ink-200 px-5 py-3 dark:border-ink-700">
            <button
              type="button"
              onClick={history.clear}
              className="inline-flex h-10 items-center rounded-lg border-2 border-ink-300 bg-white px-3.5 text-base font-medium text-ink-700 transition-colors hover:bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-ink-600 dark:bg-ink-700 dark:text-ink-100 dark:hover:bg-ink-600"
            >
              Vider l'historique
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
