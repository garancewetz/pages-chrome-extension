import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Star } from 'lucide-react';
import { BookmarkTile } from './BookmarkTile';
import { GroupCard } from './GroupCard';
import { GroupPlaceholder } from './GroupPlaceholder';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';
import type { Bookmark, Group } from './useBookmarks';
import type { BlockWidthMap } from '../../lib/widths';

type Props = {
  items: Bookmark[];
  groups: Group[];
  groupWidths: BlockWidthMap;
  autoEditId: string | null;
  onAutoEditDone: () => void;
  onRenameBookmark: (id: string, title: string) => void;
  onRemoveBookmark: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onRemoveGroup: (id: string) => void;
  onMoveGroup: (id: string, direction: 'up' | 'down') => void;
  reorderEnabled: boolean;
};

export function FavoritesPanel({
  items,
  groups,
  groupWidths,
  autoEditId,
  onAutoEditDone,
  onRenameBookmark,
  onRemoveBookmark,
  onRenameGroup,
  onRemoveGroup,
  onMoveGroup,
  reorderEnabled,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'favorites-root',
    data: { type: 'favorites-root' },
  });
  const dragType = useActiveDragType();
  const isReady = isBookmarkDropTarget(dragType) && !isOver;
  const dropClass = isOver
    ? 'border-violet-500 bg-violet-100/60 dark:bg-violet-500/10'
    : isReady
      ? 'border-dashed border-violet-400/70 bg-violet-50/40 dark:border-violet-300/40 dark:bg-violet-500/5'
      : 'border-transparent';

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="fav-h"
    >
      <header className="flex items-center gap-2">
        <Star size={15} className="shrink-0 text-ink-400 dark:text-ink-500" aria-hidden />
        <h2
          id="fav-h"
          className="font-display text-base font-semibold text-ink-700 dark:text-ink-100"
        >
          Mes favoris
        </h2>
        <span
          className="ml-0.5 text-sm text-ink-400 dark:text-ink-300"
          aria-hidden
        >
          {items.length}
        </span>
      </header>

      <div className="relative flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-300">
          Favoris directs
        </h3>
        <SortableContext
          items={items.map((b) => b.id)}
          strategy={rectSortingStrategy}
        >
          <ul
            ref={setNodeRef}
            className={`grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5 rounded-xl border-2 p-2.5 transition-colors ${dropClass}`}
            aria-label="Favoris directs"
          >
            {items.length === 0 ? (
              <li className="col-span-full grid place-items-center rounded-lg border border-dashed border-ink-200 bg-white/20 p-6 text-center text-sm text-ink-500 dark:border-ink-700/50 dark:bg-white/[0.02] dark:text-ink-300">
                Glissez ici un onglet ouvert ou un favori pour l'ajouter.
              </li>
            ) : (
              items.map((b) => (
                <BookmarkTile
                  key={b.id}
                  bookmark={b}
                  onRename={onRenameBookmark}
                  onRemove={onRemoveBookmark}
                />
              ))
            )}
          </ul>
        </SortableContext>
      </div>

      <div className="relative flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-300">
          Groupes ({groups.length})
        </h3>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {groups.map((g, i) => {
            const w = groupWidths.getWidth(g.id);
            return (
              <div
                key={g.id}
                className={w === 'full' ? 'md:col-span-2' : 'md:col-span-1'}
              >
                <GroupCard
                  group={g}
                  width={w}
                  onToggleWidth={() => groupWidths.toggle(g.id)}
                  autoEdit={autoEditId === g.id}
                  onAutoEditDone={onAutoEditDone}
                  onRenameBookmark={onRenameBookmark}
                  onRemoveBookmark={onRemoveBookmark}
                  onRenameGroup={onRenameGroup}
                  onRemoveGroup={onRemoveGroup}
                  onMoveGroup={reorderEnabled ? onMoveGroup : undefined}
                  canMoveUp={reorderEnabled && i > 0}
                  canMoveDown={reorderEnabled && i < groups.length - 1}
                />
              </div>
            );
          })}
          <GroupPlaceholder />
        </div>
      </div>
    </section>
  );
}
