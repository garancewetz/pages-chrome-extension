import { useState, type CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FolderPlus, Globe, Star, X } from 'lucide-react';
import { GroupDot } from '../../components/ui/GroupDot';
import {
  TileActionsMenu,
  type TileActionsItem,
} from '../../components/ui/TileActionsMenu';
import { getFavicon, getHostname } from '../../lib/url';
import type { AssignTarget, Group } from '../favorites/useBookmarks';
import type { Tab } from './useTabs';

type Props = {
  tab: Tab;
  groups: Group[];
  groupDotById: Record<string, string>;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onPin: (tab: Tab, target: AssignTarget) => void;
};

const rowShellBase =
  'group/row relative flex items-center gap-2 rounded-xl border-2 border-transparent bg-white/70 px-2 py-2 transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-violet-300 hover:bg-white hover:shadow-[0_6px_20px_-12px_rgba(139,92,246,0.5)] dark:bg-ink-800/60 dark:hover:border-violet-300/40 dark:hover:bg-ink-800';

const closeBtn =
  'inline-grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:text-ink-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-200';

function TabFavicon({ tab, size = 22 }: { tab: Tab; size?: number }) {
  const fallback = getFavicon(tab.url) ?? null;
  const [src, setSrc] = useState<string | null>(tab.favIconUrl ?? fallback);

  if (!src)
    return (
      <Globe size={size} className="shrink-0 text-ink-400" aria-hidden />
    );

  return (
    <img
      src={src}
      alt=""
      className="shrink-0 rounded-md"
      style={{ height: size, width: size }}
      onError={() => setSrc(src === fallback ? null : fallback)}
    />
  );
}

export function DraggableTabRow({
  tab,
  groups,
  groupDotById,
  onActivate,
  onClose,
  onPin,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tab:${tab.id}`,
    data: { type: 'tab', tab },
  });

  const style: CSSProperties = { opacity: isDragging ? 0.3 : 1 };

  const menuItems: TileActionsItem[] = [
    { kind: 'group-header', key: 'h-pin', label: 'Épingler dans' },
    {
      kind: 'action',
      key: 'pin-root',
      label: 'Hors groupe',
      icon: <Star size={16} aria-hidden />,
      onSelect: () => onPin(tab, { type: 'root' }),
      successLabel: 'Épinglé !',
    },
    ...groups.map<TileActionsItem>((g) => ({
      kind: 'action',
      key: `pin-${g.id}`,
      label: g.name,
      icon: <GroupDot color={groupDotById[g.id] ?? '#94a3b8'} />,
      onSelect: () => onPin(tab, { type: 'group', groupId: g.id }),
      successLabel: 'Épinglé !',
    })),
    {
      kind: 'action',
      key: 'pin-new',
      label: 'Nouveau groupe…',
      icon: <FolderPlus size={16} aria-hidden />,
      onSelect: () => onPin(tab, { type: 'new-group' }),
      successLabel: 'Épinglé !',
    },
  ];

  return (
    <li ref={setNodeRef} style={style} className={rowShellBase}>
      <button
        type="button"
        onClick={() => onActivate(tab)}
        aria-label={`Activer l'onglet ${tab.title}`}
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      />
      <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 items-center gap-2">
        <TabFavicon tab={tab} />
        <div className="flex min-w-0 flex-col">
          <span className="line-clamp-1 [overflow-wrap:anywhere] text-sm font-semibold leading-snug text-ink-800 dark:text-ink-100">
            {tab.title}
          </span>
          <span
            aria-hidden
            className="truncate text-xs text-ink-600 dark:text-ink-300"
          >
            {getHostname(tab.url)}
          </span>
        </div>
      </div>
      <span className="relative z-10 flex shrink-0 items-center">
        <TileActionsMenu
          items={menuItems}
          triggerLabel={`Épingler l'onglet ${tab.title}`}
          triggerVariant="square"
        />
        <button
          type="button"
          onClick={() => onClose(tab)}
          aria-label={`Fermer ${tab.title}`}
          className={closeBtn}
        >
          <X size={16} aria-hidden />
        </button>
      </span>
    </li>
  );
}

export function TabRowPreview({ tab }: { tab: Tab }) {
  return (
    <div className="flex w-64 items-center gap-2 rounded-xl border-2 border-violet-300 bg-white px-2 py-2 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.45)] dark:border-violet-300/40 dark:bg-ink-800">
      <TabFavicon tab={tab} />
      <div className="flex min-w-0 flex-col">
        <span className="line-clamp-1 [overflow-wrap:anywhere] text-sm font-semibold leading-snug text-ink-800 dark:text-ink-100">
          {tab.title}
        </span>
        <span
          aria-hidden
          className="truncate text-xs text-ink-600 dark:text-ink-300"
        >
          {getHostname(tab.url)}
        </span>
      </div>
    </div>
  );
}
