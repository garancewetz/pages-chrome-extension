import { Columns2, RectangleHorizontal, StickyNote } from 'lucide-react';
import { useNotes } from './useNotes';
import type { BlockWidth } from '../../lib/widths';

type Props = {
  width: BlockWidth;
  onToggleWidth: () => void;
};

export function NotesPanel({ width, onToggleWidth }: Props) {
  const { note, save, loaded } = useNotes();

  const ToggleIcon = width === 'full' ? Columns2 : RectangleHorizontal;
  const toggleLabel =
    width === 'full'
      ? 'Mettre la note rapide sur une demi-ligne'
      : 'Mettre la note rapide sur une ligne complète';

  return (
    <section className="flex flex-col rounded-2xl border border-white/40 bg-white/55 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-50">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-400 text-white shadow-sm">
            <StickyNote size={14} aria-hidden />
          </span>
          <span>Note rapide</span>
        </h2>
        <span className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {loaded ? 'enregistré' : '…'}
          </span>
          <button
            type="button"
            aria-label={toggleLabel}
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            className="grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-slate-700 backdrop-blur-md transition-colors hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
          >
            <ToggleIcon size={16} aria-hidden />
          </button>
        </span>
      </header>
      <div className="min-h-0 flex-1">
        <textarea
          value={note}
          onChange={(e) => save(e.target.value)}
          placeholder="Écrivez ici… (sauvegarde automatique)"
          className="h-full min-h-[140px] w-full resize-none rounded-xl border border-white/50 bg-white/40 p-3 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md focus:border-violet-400/60 focus:outline-none focus:ring-4 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
    </section>
  );
}
