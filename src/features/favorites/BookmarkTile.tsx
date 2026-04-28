import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Bookmark as BookmarkIcon,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { Tooltip } from '../../components/ui/Tooltip';
import { isExtension } from '../../lib/chrome';
import { getFavicon, getHostname } from '../../lib/url';
import type { Bookmark } from './useBookmarks';

type Props = {
  bookmark: Bookmark;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
};

function openBookmark(url: string): void {
  if (isExtension) {
    void chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

const tileBase =
  'group/tile relative aspect-square rounded-lg border-2 border-ink-200 bg-white/85 dark:border-ink-700 dark:bg-ink-800/70';

const tileHover =
  'transition-[background-color,border-color] duration-150 ease-out hover:border-violet-400 hover:bg-white dark:hover:border-violet-300 dark:hover:bg-ink-800';

const buttonWrapper =
  'absolute z-10 h-7 w-7 rounded-md border border-ink-200 bg-white text-ink-600 transition-colors duration-150 dark:border-ink-700 dark:bg-ink-700 dark:text-ink-100 opacity-60 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100';

const buttonInner =
  'grid h-full w-full place-items-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40';

export function BookmarkTile({ bookmark, onRename, onRemove }: Props) {
  const favicon = getFavicon(bookmark.url);
  const [iconFailed, setIconFailed] = useState(false);
  const showImg = favicon && !iconFailed;
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${tileBase} ${tileHover} min-w-0`}
    >
      {!editing && (
        <button
          type="button"
          onClick={() => openBookmark(bookmark.url)}
          aria-label={`Ouvrir ${bookmark.title}`}
          className="absolute inset-0 z-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
        />
      )}

      <div className="pointer-events-none relative z-[1] flex h-full w-full min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center">
        {showImg ? (
          <img
            src={favicon}
            alt=""
            loading="lazy"
            onError={() => setIconFailed(true)}
            className="h-6 w-6 rounded-sm"
          />
        ) : (
          <BookmarkIcon size={18} className="text-ink-400 dark:text-ink-500" aria-hidden />
        )}
        {editing ? (
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
            className="pointer-events-auto w-full min-w-0 rounded-md border border-violet-400/60 bg-white/90 px-1.5 py-0.5 text-center text-sm font-medium leading-snug text-ink-900 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-ink-800/90 dark:text-ink-50"
          />
        ) : (
          <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
            {bookmark.title}
          </span>
        )}
        <span className="w-full truncate text-xs text-ink-400 dark:text-ink-300">
          {getHostname(bookmark.url)}
        </span>
      </div>

      {!editing && (
        <Tooltip label="Déplacer" className={`${buttonWrapper} left-1 top-1 inline-flex`}>
          <button
            type="button"
            aria-label={`Déplacer ${bookmark.title}`}
            {...attributes}
            {...listeners}
            className={`${buttonInner} touch-none cursor-grab hover:bg-white dark:hover:bg-ink-700`}
          >
            <GripVertical size={13} aria-hidden />
          </button>
        </Tooltip>
      )}

      {!editing && (
        <Tooltip
          label="Renommer"
          side="top"
          className={`${buttonWrapper} bottom-1 right-1 inline-flex`}
        >
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Renommer ${bookmark.title}`}
            className={`${buttonInner} hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/20 dark:hover:text-violet-200`}
          >
            <Pencil size={13} aria-hidden />
          </button>
        </Tooltip>
      )}

      {!editing && (
        <ConfirmIconButton
          onConfirm={() => onRemove(bookmark.id)}
          idleIcon={<Trash2 size={13} aria-hidden />}
          idleLabel={`Supprimer ${bookmark.title}`}
          confirmLabel={`Confirmer la suppression de ${bookmark.title}`}
          tooltip="Supprimer"
          wrapperClassName={`${buttonWrapper} right-1 top-1 inline-flex`}
          className={buttonInner}
          idleClassName="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-200"
        />
      )}
    </li>
  );
}

export function BookmarkPreview({ bookmark }: { bookmark: Bookmark }) {
  const favicon = getFavicon(bookmark.url);

  return (
    <div
      className={`${tileBase} flex aspect-square w-28 min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center shadow-glass-lg`}
    >
      {favicon ? (
        <img src={favicon} alt="" className="h-6 w-6 rounded-sm" />
      ) : (
        <BookmarkIcon size={18} className="text-ink-400" aria-hidden />
      )}
      <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
        {bookmark.title}
      </span>
      <span className="w-full truncate text-xs text-ink-400">
        {getHostname(bookmark.url)}
      </span>
    </div>
  );
}
