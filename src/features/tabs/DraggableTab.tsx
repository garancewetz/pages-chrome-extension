import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Globe, GripVertical, X } from 'lucide-react';
import { ConfirmIconButton } from '../../components/ui/ConfirmIconButton';
import { Tile, TileBody, TilePreview, tileCornerInner } from '../../components/ui/Tile';
import { getFavicon } from '../../lib/url';
import type { Tab } from './useTabs';

type Props = {
  tab: Tab;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
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

export function DraggableTab({ tab, onActivate, onClose }: Props) {
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

  return (
    <Tile
      ref={setNodeRef}
      style={style}
      onActivate={() => onActivate(tab)}
      activateLabel={`Activer l'onglet ${tab.title}`}
      topLeft={
        <button
          type="button"
          aria-label={`Déplacer ${tab.title}`}
          {...attributes}
          {...listeners}
          className={`${tileCornerInner} touch-none cursor-grab hover:bg-white dark:hover:bg-ink-700`}
        >
          <GripVertical size={13} aria-hidden />
        </button>
      }
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
