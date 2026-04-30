import { useEffect, useState, type CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FolderPlus, Globe, Star, X } from 'lucide-react';
import { GroupDot } from '../../components/ui/GroupDot';
import {
  TileActionsMenu,
  type TileActionsItem,
} from '../../components/ui/TileActionsMenu';
import { getFavicon, getHostname } from '../../lib/url';
import type { PinnedRef } from '../../App';
import type { AssignTarget, Group } from '../favorites/useBookmarks';
import type { Tab } from './useTabs';

type Props = {
  tab: Tab;
  groups: Group[];
  groupDotById: Record<string, string>;
  pinnedTo: PinnedRef | null;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onPin: (tab: Tab, target: AssignTarget) => void;
};

// Couleur du liseré gauche d'une ligne épinglée. La racine utilise un gris
// clair (ink-200) qui n'appartient pas à GROUP_COLORS, donc pas de collision
// possible quel que soit le coloris choisi par l'utilisateur.
function pinnedAccent(
  pinned: PinnedRef | null,
  groupColor: string | null,
): string | null {
  if (!pinned) return null;
  if (pinned.groupId === null) return '#d6dae8';
  return groupColor ?? '#d6dae8';
}

// Bordure gauche toujours à 4 px (transparente quand non épinglée) pour
// garantir l'alignement vertical du contenu entre les lignes épinglées et
// non épinglées.
const rowShellBase =
  'group/row relative flex items-center gap-2.5 rounded-xl border-y-2 border-r-2 border-l-4 border-transparent bg-white/70 px-2 py-2 transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-violet-300 hover:bg-white hover:shadow-[0_6px_20px_-12px_rgba(139,92,246,0.5)] dark:bg-ink-800/60 dark:hover:border-violet-300/40 dark:hover:bg-ink-800';

const closeBtn =
  'inline-grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:text-ink-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-200';

function TabFavicon({ tab, size = 24 }: { tab: Tab; size?: number }) {
  const primary = tab.favIconUrl ?? null;
  const fallback = getFavicon(tab.url) ?? null;
  const [failedPrimary, setFailedPrimary] = useState(false);
  const [failedFallback, setFailedFallback] = useState(false);

  useEffect(() => {
    setFailedPrimary(false);
    setFailedFallback(false);
  }, [primary, fallback]);

  const src =
    !failedPrimary && primary
      ? primary
      : !failedFallback
        ? fallback
        : null;

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
      onError={() => {
        if (src === primary) setFailedPrimary(true);
        else setFailedFallback(true);
      }}
    />
  );
}

export function DraggableTabRow({
  tab,
  groups,
  groupDotById,
  pinnedTo,
  onActivate,
  onClose,
  onPin,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tab:${tab.id}`,
    data: { type: 'tab', tab },
  });

  const style: CSSProperties = { opacity: isDragging ? 0.3 : 1 };

  const pinnedGroupName = pinnedTo?.groupId
    ? (groups.find((g) => g.id === pinnedTo.groupId)?.name ?? null)
    : null;
  const pinnedColor =
    pinnedTo && pinnedTo.groupId !== null
      ? (groupDotById[pinnedTo.groupId] ?? null)
      : null;
  const activateLabel = pinnedTo
    ? pinnedTo.groupId === null
      ? `Activer l'onglet ${tab.title} (déjà en favoris)`
      : `Activer l'onglet ${tab.title} (déjà dans ${pinnedGroupName ?? 'un groupe'})`
    : `Activer l'onglet ${tab.title}`;

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

  const accent = pinnedAccent(pinnedTo, pinnedColor);
  const liStyle: CSSProperties = accent
    ? { ...style, borderLeftColor: accent }
    : style;

  return (
    <li ref={setNodeRef} style={liStyle} className={rowShellBase}>
      <button
        type="button"
        onClick={() => onActivate(tab)}
        aria-label={activateLabel}
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      />
      <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 items-center gap-2.5">
        <TabFavicon tab={tab} />
        <div className="flex min-w-0 flex-col">
          <span className="line-clamp-2 [overflow-wrap:anywhere] text-sm font-semibold leading-snug text-ink-800 dark:text-ink-100">
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
      <span className="relative z-10 flex shrink-0 flex-col items-center gap-1">
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
    <div className="flex w-64 items-center gap-2.5 rounded-xl border-2 border-violet-300 bg-white px-2 py-2 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.45)] dark:border-violet-300/40 dark:bg-ink-800">
      <TabFavicon tab={tab} />
      <div className="flex min-w-0 flex-col">
        <span className="line-clamp-2 [overflow-wrap:anywhere] text-sm font-semibold leading-snug text-ink-800 dark:text-ink-100">
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
