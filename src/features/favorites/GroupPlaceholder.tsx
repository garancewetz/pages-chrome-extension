import { useDroppable } from '@dnd-kit/core';
import { FolderPlus } from 'lucide-react';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';

const DRAG_HINT = 'ou glissez ici un onglet ou un favori';

type Props = {
  onCreate: () => void;
};

export function GroupPlaceholder({ onCreate }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'placeholder:group',
    data: { type: 'placeholder' },
  });
  const dragType = useActiveDragType();
  const isReady = isBookmarkDropTarget(dragType) && !isOver;

  const containerClass = isOver
    ? 'border-violet-500 bg-violet-100/70 dark:border-violet-300 dark:bg-violet-500/15'
    : isReady
      ? 'border-violet-400/70 bg-violet-50/50 dark:border-violet-300/40 dark:bg-violet-500/10'
      : 'border-ink-300/70 bg-white/30 dark:border-ink-700/60 dark:bg-white/[0.03]';

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-center backdrop-blur-md transition-colors ${containerClass}`}
    >
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-violet-300 bg-white px-3.5 py-2 text-base font-semibold text-violet-700 shadow-sm transition-colors hover:border-violet-500 hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-violet-300/40 dark:bg-ink-800 dark:text-violet-100 dark:hover:border-violet-300 dark:hover:bg-violet-500/15"
      >
        <FolderPlus size={16} aria-hidden />
        Nouveau groupe
      </button>
      <span className="text-sm text-ink-600 dark:text-ink-200">{DRAG_HINT}</span>
    </div>
  );
}
