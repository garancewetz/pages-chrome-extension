import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Bookmark as BookmarkIcon,
  FolderPlus,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { GroupDot } from '../../components/ui/GroupDot';
import { PortalTooltip } from '../../components/ui/PortalTooltip';
import {
  TileActionsMenu,
  type TileActionsItem,
} from '../../components/ui/TileActionsMenu';
import { Tile, TileBody, TilePreview, tileCornerInner } from '../../components/ui/Tile';
import { isExtension } from '../../lib/chrome';
import { getFavicon } from '../../lib/url';
import type { AssignTarget, Bookmark, Group } from './useBookmarks';

type Props = {
  bookmark: Bookmark;
  groups: Group[];
  groupDotById: Record<string, string>;
  favoritesRootId: string;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAssign: (id: string, target: AssignTarget) => void;
};

function openBookmark(url: string): void {
  if (isExtension) {
    void chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function Favicon({ url, fallbackSize = 24 }: { url: string; fallbackSize?: number }) {
  const favicon = getFavicon(url);
  const [failed, setFailed] = useState(false);
  if (favicon && !failed) {
    return (
      <img
        src={favicon}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-8 w-8 rounded-md"
      />
    );
  }
  return (
    <BookmarkIcon
      size={fallbackSize}
      className="text-ink-400 dark:text-ink-500"
      aria-hidden
    />
  );
}

export function BookmarkTile({
  bookmark,
  groups,
  groupDotById,
  favoritesRootId,
  onRename,
  onRemove,
  onAssign,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(bookmark.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftTitle(bookmark.title);
  }, [bookmark.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: bookmark.id,
    data: { type: 'bookmark', bookmark },
    disabled: editing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const commitRename = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === bookmark.title) {
      setDraftTitle(bookmark.title);
    } else {
      onRename(bookmark.id, trimmed);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setDraftTitle(bookmark.title);
    setEditing(false);
  };

  const titleNode = editing ? (
    <input
      ref={inputRef}
      value={draftTitle}
      onChange={(e) => setDraftTitle(e.target.value)}
      onBlur={commitRename}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelRename();
        }
      }}
      aria-label="Renommer le favori"
      className="pointer-events-auto w-full min-w-0 rounded-md border border-violet-400/60 bg-white/90 px-1.5 py-0.5 text-center text-base font-semibold leading-snug text-ink-900 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-ink-800/90 dark:text-ink-50"
    />
  ) : (
    <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-base font-semibold leading-snug text-ink-800 dark:text-ink-100">
      {bookmark.title}
    </span>
  );

  const menuItems: TileActionsItem[] = [
    { kind: 'group-header', key: 'h-move', label: 'Ranger dans' },
    ...(bookmark.parentId !== favoritesRootId
      ? [
          {
            kind: 'action' as const,
            key: 'move-root',
            label: 'Hors groupe',
            icon: <Star size={16} aria-hidden />,
            onSelect: () => onAssign(bookmark.id, { type: 'root' }),
          },
        ]
      : []),
    ...groups
      .filter((g) => g.id !== bookmark.parentId)
      .map<TileActionsItem>((g) => ({
        kind: 'action',
        key: `move-${g.id}`,
        label: g.name,
        icon: <GroupDot color={groupDotById[g.id] ?? '#94a3b8'} />,
        onSelect: () => onAssign(bookmark.id, { type: 'group', groupId: g.id }),
      })),
    {
      kind: 'action',
      key: 'move-new',
      label: 'Nouveau groupe…',
      icon: <FolderPlus size={16} aria-hidden />,
      onSelect: () => onAssign(bookmark.id, { type: 'new-group' }),
    },
    { kind: 'divider', key: 'd1' },
    {
      kind: 'action',
      key: 'remove',
      label: 'Supprimer ce favori',
      icon: <Trash2 size={16} aria-hidden />,
      onSelect: () => onRemove(bookmark.id),
      danger: true,
      confirmLabel: 'Cliquer pour confirmer',
    },
  ];

  return (
    <Tile
      ref={setNodeRef}
      style={style}
      onActivate={editing ? undefined : () => openBookmark(bookmark.url)}
      activateLabel={`Ouvrir ${bookmark.title}`}
      dragAttributes={editing ? undefined : attributes}
      dragListeners={editing ? undefined : listeners}
      topLeft={
        editing ? null : (
          <PortalTooltip label="Renommer">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Renommer ${bookmark.title}`}
              className={`${tileCornerInner} hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/20 dark:hover:text-violet-200`}
            >
              <Pencil size={13} aria-hidden />
            </button>
          </PortalTooltip>
        )
      }
      bottomRight={
        editing ? null : (
          <TileActionsMenu
            items={menuItems}
            triggerLabel={`Modifier le favori ${bookmark.title}`}
            triggerTooltip="Modifier ce favori"
          />
        )
      }
    >
      <TileBody
        favicon={<Favicon url={bookmark.url} />}
        title={titleNode}
        url={bookmark.url}
      />
    </Tile>
  );
}

export function BookmarkPreview({ bookmark }: { bookmark: Bookmark }) {
  return (
    <TilePreview>
      <TileBody
        favicon={<Favicon url={bookmark.url} />}
        title={
          <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
            {bookmark.title}
          </span>
        }
        url={bookmark.url}
      />
    </TilePreview>
  );
}
