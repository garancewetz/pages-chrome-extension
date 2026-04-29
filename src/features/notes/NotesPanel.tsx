import { Columns2, RectangleHorizontal, StickyNote } from 'lucide-react';
import { useNotes } from './useNotes';
import { IconButton } from '../../components/ui/IconButton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import type { BlockWidth } from '../../lib/widths';

type Props = {
  width: BlockWidth;
  onToggleWidth: () => void;
};

export function NotesPanel({ width, onToggleWidth }: Props) {
  const { note, save, loaded, saving } = useNotes();

  const ToggleIcon = width === 'full' ? RectangleHorizontal : Columns2;
  const toggleLabel =
    width === 'full'
      ? 'Mettre la note rapide sur une demi-ligne'
      : 'Mettre la note rapide sur une ligne complète';

  const status = !loaded ? '…' : saving ? 'enregistrement…' : 'enregistré';

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        icon={StickyNote}
        title="Note rapide"
        accent="amber"
        actions={
          <span className="flex items-center gap-2.5">
            <span
              aria-live="polite"
              className="text-sm text-ink-400 dark:text-ink-300"
            >
              {status}
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
        }
      />
      <div className="relative min-h-0 flex-1">
        <textarea
          value={note}
          onChange={(e) => save(e.target.value)}
          placeholder="Écrivez ici… (sauvegarde automatique)"
          className="h-full min-h-[140px] w-full resize-none rounded-2xl border-2 border-ink-200 bg-white p-4 text-base leading-relaxed text-ink-800 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] placeholder:text-ink-400 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:shadow-none dark:placeholder:text-ink-400 dark:focus:border-amber-300"
        />
      </div>
    </section>
  );
}
