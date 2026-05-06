import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Columns2,
  GripVertical,
  Pencil,
  RectangleHorizontal,
  Trash2,
} from 'lucide-react';
import { BookmarkTile } from './BookmarkTile';
import { GroupColorPicker } from './GroupColorPicker';
import { GroupDot } from '../../components/ui/GroupDot';
import { EmptyDropZone } from '../../components/ui/EmptyDropZone';
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
  /** Position dans la liste affichée (UI). */
  uiIndex: number;
  totalGroups: number;
  /** Place le groupe à un index UI absolu. Indéfini si la réorganisation est désactivée (filtre actif). */
  onMoveGroupTo?: (id: string, targetIndex: number) => void;
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
  uiIndex,
  totalGroups,
  onMoveGroupTo,
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

  const reorderEnabled = Boolean(onMoveGroupTo);
  const canMoveFirst = reorderEnabled && uiIndex > 0;
  const canMoveLast = reorderEnabled && uiIndex < totalGroups - 1;

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group-card', group, groupId: group.id },
    disabled: !reorderEnabled,
  });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    borderLeftColor: color.dot,
  };

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
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

  // « Avant other » = atterrir au slot UI de other ; si on remonte
  // (otherUi < uiIndex), on prend exactement otherUi ; si on descend, on
  // tombe juste avant other, donc otherUi - 1. On exclut les cibles qui
  // équivaudraient à ne rien faire (groupe déjà adjacent).
  const beforeTargets = allGroups
    .map((other, otherUi) => ({ other, otherUi }))
    .filter(({ other }) => other.id !== group.id)
    .map(({ other, otherUi }) => ({
      other,
      target: otherUi < uiIndex ? otherUi : otherUi - 1,
    }))
    .filter(({ target }) => target !== uiIndex);

  const hasReorderItems =
    reorderEnabled &&
    (canMoveFirst || canMoveLast || beforeTargets.length > 0);

  const reorderItems: TileActionsItem[] = hasReorderItems
    ? [
        { kind: 'divider', key: 'd-reorder' },
        { kind: 'group-header', key: 'h-reorder', label: 'Réorganiser' },
        ...(canMoveFirst
          ? [
              {
                kind: 'action' as const,
                key: 'move-first',
                label: 'Mettre en premier',
                icon: <ArrowUpToLine size={16} aria-hidden />,
                onSelect: () => onMoveGroupTo?.(group.id, 0),
                successLabel: 'Déplacé !',
              },
            ]
          : []),
        ...(canMoveLast
          ? [
              {
                kind: 'action' as const,
                key: 'move-last',
                label: 'Mettre en dernier',
                icon: <ArrowDownToLine size={16} aria-hidden />,
                onSelect: () => onMoveGroupTo?.(group.id, totalGroups - 1),
                successLabel: 'Déplacé !',
              },
            ]
          : []),
        ...(beforeTargets.length > 0
          ? [
              {
                kind: 'group-header' as const,
                key: 'h-before',
                label: 'Placer juste avant…',
              },
              ...beforeTargets.map<TileActionsItem>(({ other, target }) => ({
                kind: 'action',
                key: `move-before-${other.id}`,
                label: other.name,
                icon: <GroupDot color={groupDotById[other.id] ?? '#94a3b8'} />,
                onSelect: () => onMoveGroupTo?.(group.id, target),
                successLabel: 'Déplacé !',
              })),
            ]
          : []),
      ]
    : [];

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
    ...reorderItems,
    { kind: 'divider', key: 'd-end' },
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
      ref={setSortableRef}
      style={sortableStyle}
      className="group/card relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-l-4 border-ink-200/80 bg-white/80 p-3 transition-shadow duration-200 hover:shadow-[0_12px_32px_-18px_rgba(15,23,42,0.25)] dark:border-ink-700/70 dark:bg-ink-800/60"
      aria-label={`Groupe ${group.name}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="group/title flex min-w-0 flex-1 items-center gap-2">
          {reorderEnabled ? (
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label={`Déplacer le groupe ${group.name}`}
              className="inline-grid h-9 w-9 shrink-0 cursor-grab touch-none place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100/70 hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 active:cursor-grabbing dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-ink-50"
            >
              <GripVertical size={20} aria-hidden />
            </button>
          ) : null}
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
          ref={setDroppableRef}
          className={`grid ${width === 'half' ? 'grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))]'} gap-2 rounded-lg border-2 p-2 transition-colors ${dropClass}`}
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

export function GroupCardPreview({
  group,
  colorId,
}: {
  group: Group;
  colorId: GroupColorId;
}) {
  const color = getColor(colorId);
  return (
    <section
      className="relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-l-4 border-ink-200/80 bg-white/95 p-3 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.45)] dark:border-ink-700/70 dark:bg-ink-800/95"
      style={{ minWidth: 280, borderLeftColor: color.dot }}
      aria-hidden
    >
      <header className="flex items-center gap-2">
        <span className="inline-grid h-9 w-9 place-items-center rounded-md text-ink-400 dark:text-ink-300">
          <GripVertical size={20} aria-hidden />
        </span>
        <span className="truncate text-base font-semibold text-ink-800 dark:text-ink-100">
          {group.name}
        </span>
        <span className="ml-auto text-base font-medium text-ink-600 dark:text-ink-200">
          {group.items.length}
        </span>
      </header>
    </section>
  );
}
