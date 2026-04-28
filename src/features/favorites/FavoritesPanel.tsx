import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Star } from 'lucide-react';
import { BookmarkTile } from './BookmarkTile';
import { GroupCard } from './GroupCard';
import { GroupPlaceholder } from './GroupPlaceholder';
import { EmptyDropZone } from '../../components/ui/EmptyDropZone';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SubsectionTitle } from '../../components/ui/SubsectionTitle';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';
import type { Bookmark, Group } from './useBookmarks';
import type { BlockWidthMap } from '../../lib/widths';
import type { GroupColorMap } from '../../lib/groupColors';

type Props = {
  items: Bookmark[];
  groups: Group[];
  groupWidths: BlockWidthMap;
  groupColors: GroupColorMap;
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
  groupColors,
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
      <SectionHeader
        id="fav-h"
        icon={Star}
        title="Mes favoris"
        count={items.length}
        accent="violet"
      />

      <div className="relative flex flex-col gap-3">
        <SubsectionTitle>Favoris directs</SubsectionTitle>
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
              <EmptyDropZone>
                Glissez ici un onglet ouvert ou un favori pour l'ajouter.
              </EmptyDropZone>
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
        <SubsectionTitle>Groupes ({groups.length})</SubsectionTitle>
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
                  colorId={groupColors.getColorId(g.id, i)}
                  onChangeColor={groupColors.setColorId}
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
