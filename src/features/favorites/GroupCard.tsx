import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  Columns2,
  FolderHeart,
  RectangleHorizontal,
  Trash2,
} from 'lucide-react';
import { BookmarkTile } from './BookmarkTile';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';
import type { Group } from './useBookmarks';
import type { BlockWidth } from '../../lib/widths';

type Props = {
  group: Group;
  width: BlockWidth;
  onToggleWidth: () => void;
  autoEdit?: boolean;
  onAutoEditDone?: () => void;
  onRemoveBookmark: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onRemoveGroup: (id: string) => void;
};

export function GroupCard({
  group,
  width,
  onToggleWidth,
  autoEdit = false,
  onAutoEditDone,
  onRemoveBookmark,
  onRenameGroup,
  onRemoveGroup,
}: Props) {
  const [name, setName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(group.name);
  }, [group.name]);

  useEffect(() => {
    if (autoEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      onAutoEditDone?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);

  const { setNodeRef, isOver } = useDroppable({
    id: `group:${group.id}`,
    data: { type: 'group', groupId: group.id },
  });
  const dragType = useActiveDragType();
  const isReady = isBookmarkDropTarget(dragType) && !isOver;

  const dropClass = isOver
    ? 'border-violet-500 bg-violet-100/60 dark:bg-violet-500/10'
    : isReady
      ? 'border-dashed border-violet-400/70 bg-violet-50/30 dark:border-violet-300/40 dark:bg-violet-500/5'
      : 'border-transparent';

  const commit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(group.name);
      return;
    }
    if (trimmed !== group.name) {
      onRenameGroup(group.id, trimmed);
    }
  };

  const ToggleIcon = width === 'full' ? Columns2 : RectangleHorizontal;
  const toggleLabel =
    width === 'full'
      ? `Mettre « ${group.name} » sur une demi-ligne`
      : `Mettre « ${group.name} » sur une ligne complète`;

  return (
    <section
      className="flex flex-col gap-2 rounded-2xl border-2 border-white/40 bg-white/60 p-3 shadow-md shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
      aria-label={`Groupe ${group.name}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow">
            <FolderHeart size={18} aria-hidden />
          </span>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setName(group.name);
                e.currentTarget.blur();
              }
            }}
            aria-label="Nom du groupe"
            className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-slate-900 transition-colors hover:bg-slate-500/5 focus:border-violet-400/60 focus:bg-white/60 focus:outline-none dark:text-slate-50 dark:hover:bg-white/5 dark:focus:bg-white/10"
          />
          <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
            {group.items.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={toggleLabel}
            aria-pressed={width === 'full'}
            onClick={onToggleWidth}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-slate-100"
          >
            <ToggleIcon size={16} aria-hidden />
          </button>
          <ConfirmIconButton
            onConfirm={() => onRemoveGroup(group.id)}
            idleIcon={<Trash2 size={16} aria-hidden />}
            idleLabel={`Supprimer le groupe ${group.name}`}
            confirmLabel={`Confirmer la suppression du groupe ${group.name}`}
            className="grid h-9 w-9 place-items-center rounded-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
            idleClassName="text-slate-600 hover:bg-rose-100 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-500/30 dark:hover:text-rose-100"
          />
        </div>
      </header>

      <SortableContext
        items={group.items.map((b) => b.id)}
        strategy={rectSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className={`grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3 rounded-xl border-2 p-2 transition-colors ${dropClass}`}
          aria-label={`Favoris de ${group.name}`}
        >
          {group.items.length === 0 ? (
            <li className="col-span-full grid place-items-center rounded-xl border-2 border-dashed border-slate-300/70 p-6 text-center text-base text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
              Glissez ici un onglet ouvert ou un favori pour l'ajouter à « {group.name} ».
            </li>
          ) : (
            group.items.map((b) => (
              <BookmarkTile
                key={b.id}
                bookmark={b}
                onRemove={onRemoveBookmark}
              />
            ))
          )}
        </ul>
      </SortableContext>
    </section>
  );
}
