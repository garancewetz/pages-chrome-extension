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
import type { AssignTarget, Bookmark, Group } from './useBookmarks';
import type { BlockWidthMap } from '../../lib/widths';
import type { GroupColorMap } from '../../lib/groupColors';

type Props = {
  items: Bookmark[];
  groups: Group[];
  /** Liste complète (non filtrée) — utilisée pour les menus d'assignation. */
  allGroups: Group[];
  /** Couleur (hex dot) par id de groupe — pour les pastilles dans les menus. */
  groupDotById: Record<string, string>;
  favoritesRootId: string;
  groupWidths: BlockWidthMap;
  groupColors: GroupColorMap;
  autoEditId: string | null;
  onAutoEditDone: () => void;
  onRenameBookmark: (id: string, title: string) => void;
  onRemoveBookmark: (id: string) => void;
  onAssignBookmark: (id: string, target: AssignTarget) => void;
  onRenameGroup: (id: string, name: string) => void;
  onRemoveGroup: (id: string) => void;
  onMoveGroupTo: (id: string, targetIndex: number) => void;
  onCreateEmptyGroup: () => void;
  reorderEnabled: boolean;
};

export function FavoritesPanel({
  items,
  groups,
  allGroups,
  groupDotById,
  favoritesRootId,
  groupWidths,
  groupColors,
  autoEditId,
  onAutoEditDone,
  onRenameBookmark,
  onRemoveBookmark,
  onAssignBookmark,
  onRenameGroup,
  onRemoveGroup,
  onMoveGroupTo,
  onCreateEmptyGroup,
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
                  groups={allGroups}
                  groupDotById={groupDotById}
                  favoritesRootId={favoritesRootId}
                  onRename={onRenameBookmark}
                  onRemove={onRemoveBookmark}
                  onAssign={onAssignBookmark}
                />
              ))
            )}
          </ul>
        </SortableContext>
      </div>

      <div className="relative flex flex-col gap-3">
        <SubsectionTitle>Groupes ({groups.length})</SubsectionTitle>
        <SortableContext
          items={groups.map((g) => g.id)}
          strategy={rectSortingStrategy}
        >
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
                    allGroups={allGroups}
                    groupDotById={groupDotById}
                    favoritesRootId={favoritesRootId}
                    onToggleWidth={() => groupWidths.toggle(g.id)}
                    autoEdit={autoEditId === g.id}
                    onAutoEditDone={onAutoEditDone}
                    onRenameBookmark={onRenameBookmark}
                    onRemoveBookmark={onRemoveBookmark}
                    onAssignBookmark={onAssignBookmark}
                    onRenameGroup={onRenameGroup}
                    onRemoveGroup={onRemoveGroup}
                    uiIndex={i}
                    totalGroups={groups.length}
                    onMoveGroupTo={reorderEnabled ? onMoveGroupTo : undefined}
                    colorId={groupColors.getColorId(g.id, i)}
                    onChangeColor={groupColors.setColorId}
                  />
                </div>
              );
            })}
            <GroupPlaceholder onCreate={onCreateEmptyGroup} />
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
