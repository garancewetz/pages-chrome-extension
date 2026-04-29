import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  ChevronDown,
  ChevronUp,
  Columns2,
  Pencil,
  RectangleHorizontal,
  Trash2,
} from 'lucide-react';
import { BookmarkTile } from './BookmarkTile';
import { GroupColorPicker } from './GroupColorPicker';
import { EmptyDropZone } from '../../components/ui/EmptyDropZone';
import { IconButton } from '../../components/ui/IconButton';
import {
  TileActionsMenu,
  type TileActionsItem,
} from '../../components/ui/TileActionsMenu';
import { isBookmarkDropTarget, useActiveDragType } from '../../lib/dnd';
import { getColor, type GroupColorId } from '../../lib/groupColors';
import type { AssignTarget, Group } from './useBookmarks';
import type { BlockWidth } from '../../lib/widths';

type Props = {
  group: Group;
  width: BlockWidth;
  allGroups: Group[];
  groupDotById: Record<string, string>;
  favoritesRootId: string;
  onToggleWidth: () => void;
  autoEdit?: boolean;
  onAutoEditDone?: () => void;
  onRenameBookmark: (id: string, title: string) => void;
  onRemoveBookmark: (id: string) => void;
  onAssignBookmark: (id: string, target: AssignTarget) => void;
  onRenameGroup: (id: string, name: string) => void;
  onRemoveGroup: (id: string) => void;
  onMoveGroup?: (id: string, direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  colorId: GroupColorId;
  onChangeColor: (id: string, color: GroupColorId) => void;
};

export function GroupCard({
  group,
  width,
  allGroups,
  groupDotById,
  favoritesRootId,
  onToggleWidth,
  autoEdit = false,
  onAutoEditDone,
  onRenameBookmark,
  onRemoveBookmark,
  onAssignBookmark,
  onRenameGroup,
  onRemoveGroup,
  onMoveGroup,
  canMoveUp,
  canMoveDown,
  colorId,
  onChangeColor,
}: Props) {
  const color = getColor(colorId);
  const [name, setName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(group.name);
  }, [group.name]);

  useEffect(() => {
    if (autoEdit && inputRef.current) {
      // Vide le champ pour laisser apparaître le placeholder (« Nouveau groupe »)
      // afin que l'utilisateur puisse taper directement sans rien effacer.
      setName('');
      inputRef.current.focus();
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

  const ToggleIcon = width === 'full' ? RectangleHorizontal : Columns2;
  const toggleLabel =
    width === 'full' ? 'Mettre sur une demi-ligne' : 'Mettre en pleine largeur';

  const menuItems: TileActionsItem[] = [
    {
      kind: 'action',
      key: 'rename',
      label: 'Renommer le groupe',
      icon: <Pencil size={16} aria-hidden />,
      onSelect: () => inputRef.current?.focus(),
    },
    {
      kind: 'action',
      key: 'toggle-width',
      label: toggleLabel,
      icon: <ToggleIcon size={16} aria-hidden />,
      onSelect: onToggleWidth,
    },
    { kind: 'divider', key: 'd1' },
    {
      kind: 'action',
      key: 'remove',
      label: 'Supprimer ce groupe',
      icon: <Trash2 size={16} aria-hidden />,
      onSelect: () => onRemoveGroup(group.id),
      danger: true,
    },
  ];

  return (
    <section
      className="group/card relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-l-4 border-ink-200/80 bg-white/80 p-3 transition-shadow duration-200 hover:shadow-[0_12px_32px_-18px_rgba(15,23,42,0.25)] dark:border-ink-700/70 dark:bg-ink-800/60"
      style={{ borderLeftColor: color.dot }}
      aria-label={`Groupe ${group.name}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="group/title flex min-w-0 flex-1 items-center gap-2">
          <GroupColorPicker
            current={colorId}
            groupName={group.name}
            onChange={(id) => onChangeColor(group.id, id)}
          />
          <input
            ref={inputRef}
            value={name}
            placeholder={group.name}
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
            className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-base font-semibold text-ink-800 transition-colors hover:bg-ink-500/5 focus:border-ink-300/60 focus:bg-white/70 focus:outline-none dark:text-ink-100 dark:hover:bg-white/5 dark:focus:bg-white/10"
          />
          <span className="shrink-0 text-base font-medium text-ink-600 dark:text-ink-200">
            {group.items.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onMoveGroup ? (
            <>
              <IconButton
                variant="bare"
                label={`Monter le groupe ${group.name}`}
                onClick={() => onMoveGroup(group.id, 'up')}
                disabled={!canMoveUp}
                icon={<ChevronUp size={16} aria-hidden />}
              />
              <IconButton
                variant="bare"
                label={`Descendre le groupe ${group.name}`}
                onClick={() => onMoveGroup(group.id, 'down')}
                disabled={!canMoveDown}
                icon={<ChevronDown size={16} aria-hidden />}
              />
            </>
          ) : null}
          <TileActionsMenu
            items={menuItems}
            triggerLabel={`Actions du groupe ${group.name}`}
            triggerVariant="square"
          />
        </div>
      </header>

      <SortableContext
        items={group.items.map((b) => b.id)}
        strategy={rectSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className={`grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 rounded-lg border-2 p-2 transition-colors ${dropClass}`}
          aria-label={`Favoris de ${group.name}`}
        >
          {group.items.length === 0 ? (
            <EmptyDropZone size="sm">
              Glissez ici un onglet ouvert ou un favori pour l'ajouter à «&nbsp;
              {group.name}&nbsp;».
            </EmptyDropZone>
          ) : (
            group.items.map((b) => (
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
    </section>
  );
}
