import { Columns2, RectangleHorizontal, StickyNote } from 'lucide-react';
import { useNotes } from './useNotes';
import type { BlockWidth } from '../../lib/widths';

type Props = {
  width: BlockWidth;
  onToggleWidth: () => void;
};

export function NotesPanel({ width, onToggleWidth }: Props) {
  const { note, save, loaded } = useNotes();

  const ToggleIcon = width === 'full' ? RectangleHorizontal : Columns2;
  const toggleLabel =
    width === 'full'
      ? 'Mettre la note rapide sur une demi-ligne'
      : 'Mettre la note rapide sur une ligne complète';

  return (
    <section className="flex flex-col rounded-2xl glass p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          <StickyNote size={15} className="shrink-0 text-ink-400 dark:text-ink-500" aria-hidden />
          <span className="font-display text-base font-semibold text-ink-700 dark:text-ink-100">
            Note rapide
          </span>
        </h2>
        <span className="flex items-center gap-2.5">
          <span className="text-sm text-ink-400 dark:text-ink-300">
            {loaded ? 'enregistré' : '…'}
          </span>
          <button
            type="button"
            aria-label={toggleLabel}
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink-200 bg-white text-ink-500 transition-colors hover:border-violet-400 hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-violet-300 dark:hover:text-ink-50"
          >
            <ToggleIcon size={16} aria-hidden />
          </button>
        </span>
      </header>
      <div className="relative min-h-0 flex-1">
        <textarea
          value={note}
          onChange={(e) => save(e.target.value)}
          placeholder="Écrivez ici… (sauvegarde automatique)"
          className="h-full min-h-[140px] w-full resize-none rounded-lg border-2 border-ink-200 bg-white p-3 text-base leading-relaxed text-ink-800 placeholder:text-ink-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-400 dark:focus:border-violet-300"
        />
      </div>
    </section>
  );
}
