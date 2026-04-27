import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark as BookmarkIcon, GripVertical, X } from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { isExtension } from '../../lib/chrome';
import { getFavicon, getHostname } from '../../lib/url';
import type { Bookmark } from './useBookmarks';

type Props = {
  bookmark: Bookmark;
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
  'relative aspect-square rounded-2xl border border-white/40 bg-white/55 backdrop-blur-xl shadow-lg shadow-black/5 dark:border-white/10 dark:bg-white/5';

const tileHover =
  'transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-white/70 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10';

const buttonBase =
  'absolute z-10 grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-slate-700 backdrop-blur-md dark:bg-white/10 dark:text-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50 transition-colors';

export function BookmarkTile({ bookmark, onRemove }: Props) {
  const favicon = getFavicon(bookmark.url);
  const [iconFailed, setIconFailed] = useState(false);
  const showImg = favicon && !iconFailed;

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
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={`${tileBase} ${tileHover}`}>
      <button
        type="button"
        onClick={() => openBookmark(bookmark.url)}
        aria-label={`Ouvrir ${bookmark.title}`}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
      />

      <div className="pointer-events-none relative z-[1] flex h-full flex-col items-center justify-center gap-1.5 p-2.5 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-rose-400/20 text-violet-700 dark:from-violet-400/30 dark:to-rose-400/30 dark:text-violet-100">
          {showImg ? (
            <img
              src={favicon}
              alt=""
              loading="lazy"
              onError={() => setIconFailed(true)}
              className="h-6 w-6 rounded"
            />
          ) : (
            <BookmarkIcon size={20} aria-hidden />
          )}
        </span>
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">
          {bookmark.title}
        </span>
        <span className="max-w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
          {getHostname(bookmark.url)}
        </span>
      </div>

      <button
        type="button"
        aria-label={`Déplacer ${bookmark.title}`}
        {...attributes}
        {...listeners}
        className={`${buttonBase} left-1 top-1 touch-none cursor-grab hover:bg-white dark:hover:bg-white/20`}
      >
        <GripVertical size={16} aria-hidden />
      </button>

      <ConfirmIconButton
        onConfirm={() => onRemove(bookmark.id)}
        idleIcon={<X size={16} aria-hidden />}
        idleLabel={`Retirer ${bookmark.title}`}
        confirmLabel={`Confirmer la suppression de ${bookmark.title}`}
        className={`${buttonBase} right-1 top-1`}
        idleClassName="hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/30 dark:hover:text-rose-100"
      />
    </li>
  );
}

export function BookmarkPreview({ bookmark }: { bookmark: Bookmark }) {
  const favicon = getFavicon(bookmark.url);

  return (
    <div
      className={`${tileBase} flex aspect-square w-32 flex-col items-center justify-center gap-1.5 p-2.5 text-center`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-rose-400/20 text-violet-700 dark:from-violet-400/30 dark:to-rose-400/30 dark:text-violet-100">
        {favicon ? (
          <img src={favicon} alt="" className="h-6 w-6 rounded" />
        ) : (
          <BookmarkIcon size={20} aria-hidden />
        )}
      </span>
      <span className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">
        {bookmark.title}
      </span>
      <span className="max-w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
        {getHostname(bookmark.url)}
      </span>
    </div>
  );
}
