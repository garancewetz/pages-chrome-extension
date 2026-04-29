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
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { EmptyDropZone } from '../../components/ui/EmptyDropZone';
import { IconButton } from '../../components/ui/IconButton';
import { Tooltip } from '../../components/ui/Tooltip';
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

  const ToggleIcon = width === 'full' ? RectangleHorizontal : Columns2;
  const toggleLabel =
    width === 'full'
      ? `Mettre « ${group.name} » sur une demi-ligne`
      : `Mettre « ${group.name} » sur une ligne complète`;

  return (
    <section
      className="group/card relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-l-4 border-ink-200/80 bg-white/80 p-3 transition-shadow duration-200 hover:shadow-[0_12px_32px_-18px_rgba(15,23,42,0.25)] dark:border-ink-700/70 dark:bg-ink-800/60"
      style={{
        borderLeftColor: color.dot,
        backgroundImage: `linear-gradient(135deg, ${color.dot}26 0%, transparent 50%)`,
      }}
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
          <Tooltip label="Renommer">
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              aria-label={`Renommer le groupe ${group.name}`}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-400 transition-colors hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:text-ink-400 dark:hover:bg-violet-500/20 dark:hover:text-violet-200"
            >
              <Pencil size={12} aria-hidden />
            </button>
          </Tooltip>
          <span className="shrink-0 text-sm text-ink-400 dark:text-ink-300">
            {group.items.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onMoveGroup ? (
            <>
              <IconButton
                variant="bare"
                label={`Déplacer le groupe ${group.name} vers le haut`}
                tooltip="Monter"
                onClick={() => onMoveGroup(group.id, 'up')}
                disabled={!canMoveUp}
                icon={<ChevronUp size={16} aria-hidden />}
              />
              <IconButton
                variant="bare"
                label={`Déplacer le groupe ${group.name} vers le bas`}
                tooltip="Descendre"
                onClick={() => onMoveGroup(group.id, 'down')}
                disabled={!canMoveDown}
                icon={<ChevronDown size={16} aria-hidden />}
              />
            </>
          ) : null}
          <IconButton
            variant="bare"
            label={toggleLabel}
            tooltip={width === 'full' ? 'Demi-ligne' : 'Pleine largeur'}
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            icon={<ToggleIcon size={16} aria-hidden />}
          />
          <ConfirmIconButton
            onConfirm={() => onRemoveGroup(group.id)}
            idleIcon={<Trash2 size={16} aria-hidden />}
            idleLabel={`Supprimer le groupe ${group.name}`}
            confirmLabel={`Confirmer la suppression du groupe ${group.name}`}
            tooltip="Supprimer"
            className="grid h-8 w-8 place-items-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            idleClassName="text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:text-ink-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-200"
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
