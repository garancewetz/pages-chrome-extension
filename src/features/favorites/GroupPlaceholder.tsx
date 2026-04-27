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
    ? 'border-violet-500 bg-violet-100/60 text-violet-800 dark:border-violet-300 dark:bg-violet-500/15 dark:text-violet-100'
    : isReady
      ? 'border-violet-400/70 bg-violet-50/40 text-violet-700 dark:border-violet-300/40 dark:bg-violet-500/5 dark:text-violet-100'
      : 'border-slate-300/70 text-slate-500 dark:border-slate-700/70 dark:text-slate-400';
  const iconClass = isOver
    ? 'bg-violet-500 text-white'
    : isReady
      ? 'bg-violet-200/70 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100'
      : 'bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-300';

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[88px] items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-center text-base transition-colors ${containerClass}`}
      aria-label={LABEL}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
      >
        <FolderPlus size={18} aria-hidden />
      </span>
      <span className="font-medium">{LABEL}</span>
    </div>
  );
}
