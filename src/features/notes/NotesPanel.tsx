import { Columns2, RectangleHorizontal, StickyNote } from 'lucide-react';
import { useNotes } from './useNotes';
import { IconButton } from '../../components/ui/IconButton';
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
    <section className="flex flex-col">
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
          <IconButton
            variant="square"
            label={toggleLabel}
            tooltip={width === 'full' ? 'Demi-ligne' : 'Pleine largeur'}
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            icon={<ToggleIcon size={16} aria-hidden />}
          />
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
