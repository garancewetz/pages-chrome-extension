import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Globe, GripVertical, X } from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
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

  if (!src) return <Globe size={20} aria-hidden />;

  return (
    <img
      src={src}
      alt=""
      className="h-6 w-6 rounded"
      onError={() => setSrc(src === fallback ? null : fallback)}
    />
  );
}

const tabBase =
  'relative aspect-square rounded-2xl border border-white/40 bg-white/45 backdrop-blur-xl shadow-md shadow-black/5 dark:border-white/10 dark:bg-white/[0.03]';

const tabHover =
  'transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-white/65 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10';

const buttonBase =
  'absolute z-10 grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-slate-700 backdrop-blur-md dark:bg-white/10 dark:text-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50 transition-colors';

export function DraggableTab({ tab, onActivate, onClose }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tab:${tab.id}`,
    data: { type: 'tab', tab },
  });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={`${tabBase} ${tabHover} min-w-0`}>
      <button
        type="button"
        onClick={() => onActivate(tab)}
        aria-label={`Activer l'onglet ${tab.title}`}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50"
      />

      <div className="pointer-events-none relative z-[1] flex h-full w-full min-w-0 flex-col items-center justify-center gap-1.5 p-2.5 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400/20 to-cyan-400/20 text-sky-700 dark:from-sky-400/30 dark:to-cyan-400/30 dark:text-sky-100">
          <TabFavicon tab={tab} />
        </span>
        <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-tight text-slate-900 dark:text-slate-50">
          {tab.title}
        </span>
        <span className="w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
          {getHostname(tab.url)}
        </span>
      </div>

      <button
        type="button"
        aria-label={`Déplacer ${tab.title}`}
        {...attributes}
        {...listeners}
        className={`${buttonBase} left-1 top-1 touch-none cursor-grab hover:bg-white dark:hover:bg-white/20`}
      >
        <GripVertical size={16} aria-hidden />
      </button>

      <ConfirmIconButton
        onConfirm={() => onClose(tab)}
        idleIcon={<X size={16} aria-hidden />}
        idleLabel={`Fermer ${tab.title}`}
        confirmLabel={`Confirmer la fermeture de ${tab.title}`}
        className={`${buttonBase} right-1 top-1`}
        idleClassName="hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/30 dark:hover:text-rose-100"
      />
    </li>
  );
}

export function TabPreview({ tab }: { tab: Tab }) {
  return (
    <div
      className={`${tabBase} flex aspect-square w-32 min-w-0 flex-col items-center justify-center gap-1.5 p-2.5 text-center`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400/20 to-cyan-400/20 text-sky-700 dark:from-sky-400/30 dark:to-cyan-400/30 dark:text-sky-100">
        <TabFavicon tab={tab} />
      </span>
      <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-tight text-slate-900 dark:text-slate-50">
        {tab.title}
      </span>
      <span className="w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
        {getHostname(tab.url)}
      </span>
    </div>
  );
}
