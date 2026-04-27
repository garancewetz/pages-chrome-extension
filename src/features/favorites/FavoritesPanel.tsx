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
  onRemoveBookmark: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onRemoveGroup: (id: string) => void;
};

export function FavoritesPanel({
  items,
  groups,
  groupWidths,
  autoEditId,
  onAutoEditDone,
  onRemoveBookmark,
  onRenameGroup,
  onRemoveGroup,
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
      className="flex flex-col gap-4 rounded-3xl border-2 border-violet-200/70 bg-gradient-to-br from-violet-50/80 via-white/40 to-rose-50/60 p-5 shadow-lg shadow-violet-500/5 dark:border-violet-500/30 dark:from-violet-500/10 dark:via-transparent dark:to-rose-500/10"
      aria-labelledby="fav-h"
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-md">
            <Star size={20} aria-hidden />
          </span>
          <h2
            id="fav-h"
            className="bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-2xl font-semibold text-transparent dark:from-violet-300 dark:to-rose-300"
          >
            Mes favoris
          </h2>
          <span
            className="text-base text-slate-500 dark:text-slate-400"
            aria-hidden
          >
            {items.length}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Vos pages préférées, accessibles en un clic. Glissez un onglet ou un
          favori ici pour l'ajouter, ou créez un groupe pour les organiser.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-700/80 dark:text-violet-200/80">
          Favoris directs
        </h3>
        <SortableContext
          items={items.map((b) => b.id)}
          strategy={rectSortingStrategy}
        >
          <ul
            ref={setNodeRef}
            className={`grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 rounded-2xl border-2 p-3 transition-colors ${dropClass}`}
            aria-label="Favoris directs"
          >
            {items.length === 0 ? (
              <li className="col-span-full grid place-items-center rounded-xl border-2 border-dashed border-violet-300/60 p-6 text-center text-base text-slate-600 dark:border-violet-400/30 dark:text-slate-300">
                Glissez ici un onglet ouvert ou un favori pour l'ajouter.
              </li>
            ) : (
              items.map((b) => (
                <BookmarkTile
                  key={b.id}
                  bookmark={b}
                  onRemove={onRemoveBookmark}
                />
              ))
            )}
          </ul>
        </SortableContext>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-700/80 dark:text-violet-200/80">
          Groupes ({groups.length})
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {groups.map((g) => {
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
                  onRemoveBookmark={onRemoveBookmark}
                  onRenameGroup={onRenameGroup}
                  onRemoveGroup={onRemoveGroup}
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
