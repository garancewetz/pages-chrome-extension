import { useDroppable } from '@dnd-kit/core';
import { FolderPlus } from 'lucide-react';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';

const LABEL = 'Glisser ici pour créer un nouveau groupe';

export function GroupPlaceholder() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'placeholder:group',
    data: { type: 'placeholder' },
  });
  const dragType = useActiveDragType();
  const isReady = isBookmarkDropTarget(dragType) && !isOver;

  const containerClass = isOver
    ? 'border-violet-500 bg-violet-100/70 text-violet-800 dark:border-violet-300 dark:bg-violet-500/15 dark:text-violet-100'
    : isReady
      ? 'border-violet-400/70 bg-violet-50/50 text-violet-700 dark:border-violet-300/40 dark:bg-violet-500/10 dark:text-violet-100'
      : 'border-ink-300/70 bg-white/30 text-ink-500 dark:border-ink-700/60 dark:bg-white/[0.03] dark:text-ink-300';
  const iconClass = isOver
    ? 'bg-violet-500 text-white shadow-glow-violet'
    : isReady
      ? 'bg-violet-200/70 text-violet-700 dark:bg-violet-500/25 dark:text-violet-100'
      : 'bg-white/70 text-ink-600 dark:bg-white/10 dark:text-ink-200';

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[80px] items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-3 text-center text-sm font-medium backdrop-blur-md transition-colors ${containerClass}`}
      aria-label={LABEL}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconClass}`}
      >
        <FolderPlus size={16} aria-hidden />
      </span>
      <span>{LABEL}</span>
    </div>
  );
}
