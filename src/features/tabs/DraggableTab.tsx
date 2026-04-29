import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FolderPlus, Globe, Star, X } from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { GroupDot } from '../../components/ui/GroupDot';
import {
  TileActionsMenu,
  type TileActionsItem,
} from '../../components/ui/TileActionsMenu';
import { Tile, TileBody, TilePreview, tileCornerInner } from '../../components/ui/Tile';
import { getFavicon } from '../../lib/url';
import type { AssignTarget, Group } from '../../features/favorites/useBookmarks';
import type { Tab } from './useTabs';

type Props = {
  tab: Tab;
  groups: Group[];
  groupDotById: Record<string, string>;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onPin: (tab: Tab, target: AssignTarget) => void;
};

function TabFavicon({ tab }: { tab: Tab }) {
  const fallback = getFavicon(tab.url) ?? null;
  const [src, setSrc] = useState<string | null>(tab.favIconUrl ?? fallback);

  if (!src) return <Globe size={24} className="text-ink-400" aria-hidden />;

  return (
    <img
      src={src}
      alt=""
      className="h-8 w-8 rounded-md"
      onError={() => setSrc(src === fallback ? null : fallback)}
    />
  );
}

export function DraggableTab({
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

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  };

  const titleNode = (
    <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-base font-semibold leading-snug text-ink-800 dark:text-ink-100">
      {tab.title}
    </span>
  );

  const menuItems: TileActionsItem[] = [
    { kind: 'group-header', key: 'h-pin', label: 'Épingler dans' },
    {
      kind: 'action',
      key: 'pin-root',
      label: 'Hors groupe',
      icon: <Star size={16} aria-hidden />,
      onSelect: () => onPin(tab, { type: 'root' }),
    },
    ...groups.map<TileActionsItem>((g) => ({
      kind: 'action',
      key: `pin-${g.id}`,
      label: g.name,
      icon: <GroupDot color={groupDotById[g.id] ?? '#94a3b8'} />,
      onSelect: () => onPin(tab, { type: 'group', groupId: g.id }),
    })),
    {
      kind: 'action',
      key: 'pin-new',
      label: 'Nouveau groupe…',
      icon: <FolderPlus size={16} aria-hidden />,
      onSelect: () => onPin(tab, { type: 'new-group' }),
    },
  ];

  return (
    <Tile
      ref={setNodeRef}
      style={style}
      onActivate={() => onActivate(tab)}
      activateLabel={`Activer l'onglet ${tab.title}`}
      dragAttributes={attributes}
      dragListeners={listeners}
      topRight={
        <ConfirmIconButton
          onConfirm={() => onClose(tab)}
          idleIcon={<X size={13} aria-hidden />}
          idleLabel={`Fermer ${tab.title}`}
          confirmLabel={`Confirmer la fermeture de ${tab.title}`}
          tooltip="Fermer"
          className={tileCornerInner}
          idleClassName="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-200"
        />
      }
      bottomRight={
        <TileActionsMenu
          items={menuItems}
          triggerLabel={`Épingler l'onglet ${tab.title}`}
          triggerTooltip="Épingler cet onglet"
        />
      }
    >
      <TileBody favicon={<TabFavicon tab={tab} />} title={titleNode} url={tab.url} />
    </Tile>
  );
}

export function TabPreview({ tab }: { tab: Tab }) {
  return (
    <TilePreview>
      <TileBody
        favicon={<TabFavicon tab={tab} />}
        title={
          <span className="line-clamp-2 w-full [overflow-wrap:anywhere] text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">
            {tab.title}
          </span>
        }
        url={tab.url}
      />
    </TilePreview>
  );
}
