import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Globe, GripVertical, X } from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { Tooltip } from '../../components/ui/Tooltip';
import { getFavicon, getHostname } from '../../lib/url';
import type { Tab } from './useTabs';

type Props = {
  tab: Tab;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
};

function TabFavicon({ tab }: { tab: Tab }) {
  const fallback = getFavicon(tab.url) ?? null;
  const [src, setSrc] = useState<string | null>(tab.favIconUrl ?? fallback);

  if (!src) return <Globe size={18} className="text-ink-400" aria-hidden />;

  return (
    <img
      src={src}
      alt=""
      className="h-6 w-6 rounded-sm"
      onError={() => setSrc(src === fallback ? null : fallback)}
    />
  );
}

const tabBase =
  'group/tab relative aspect-square rounded-lg border-2 border-ink-200 bg-white/85 dark:border-ink-700 dark:bg-ink-800/70';

const tabHover =
  'transition-[background-color,border-color] duration-150 ease-out hover:border-violet-400 hover:bg-white dark:hover:border-violet-300 dark:hover:bg-ink-800';

const buttonWrapper =
  'absolute z-10 h-7 w-7 rounded-md border border-ink-200 bg-white text-ink-600 transition-colors duration-150 dark:border-ink-700 dark:bg-ink-700 dark:text-ink-100 opacity-0 group-hover/tab:opacity-100 group-focus-within/tab:opacity-100';

const buttonInner =
  'grid h-full w-full place-items-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40';

export function DraggableTab({ tab, onActivate, onClose }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tab:${tab.id}`,
    data: { type: 'tab', tab },
  });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${tabBase} ${tabHover} min-w-0`}
    >
      <button
        type="button"
        onClick={() => onActivate(tab)}
        aria-label={`Activer l'onglet ${tab.title}`}
        className="absolute inset-0 z-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      />

      <div className="pointer-events-none relative z-[1] flex h-full w-full min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center">
        <TabFavicon tab={tab} />
        <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
          {tab.title}
        </span>
        <span className="w-full truncate text-xs text-ink-400 dark:text-ink-300">
          {getHostname(tab.url)}
        </span>
      </div>

      <Tooltip label="Déplacer" className={`${buttonWrapper} left-1 top-1 inline-flex`}>
        <button
          type="button"
          aria-label={`Déplacer ${tab.title}`}
          {...attributes}
          {...listeners}
          className={`${buttonInner} touch-none cursor-grab hover:bg-white dark:hover:bg-ink-700`}
        >
          <GripVertical size={13} aria-hidden />
        </button>
      </Tooltip>

      <ConfirmIconButton
        onConfirm={() => onClose(tab)}
        idleIcon={<X size={13} aria-hidden />}
        idleLabel={`Fermer ${tab.title}`}
        confirmLabel={`Confirmer la fermeture de ${tab.title}`}
        tooltip="Fermer"
        wrapperClassName={`${buttonWrapper} right-1 top-1 inline-flex`}
        className={buttonInner}
        idleClassName="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-200"
      />
    </li>
  );
}

export function TabPreview({ tab }: { tab: Tab }) {
  return (
    <div
      className={`${tabBase} flex aspect-square w-28 min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center`}
    >
      {tab.favIconUrl ? (
        <img src={tab.favIconUrl} alt="" className="h-6 w-6 rounded-sm" />
      ) : (
        <Globe size={18} className="text-ink-400" aria-hidden />
      )}
      <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
        {tab.title}
      </span>
      <span className="w-full truncate text-xs text-ink-400 dark:text-ink-300">
        {getHostname(tab.url)}
      </span>
    </div>
  );
}
