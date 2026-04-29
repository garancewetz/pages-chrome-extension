import { Columns2, Globe, RectangleHorizontal } from 'lucide-react';
import type { Tab } from './useTabs';
import { DraggableTab } from './DraggableTab';
import { IconButton } from '../../components/ui/IconButton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import type { BlockWidth } from '../../lib/widths';
import type { AssignTarget, Group } from '../favorites/useBookmarks';

type TabsPanelProps = {
  tabs: Tab[];
  loading: boolean;
  groups: Group[];
  groupDotById: Record<string, string>;
  width: BlockWidth;
  onToggleWidth: () => void;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onPinTab: (tab: Tab, target: AssignTarget) => void;
};

export function TabsPanel({
  tabs,
  loading,
  groups,
  groupDotById,
  width,
  onToggleWidth,
  onActivate,
  onClose,
  onPinTab,
}: TabsPanelProps) {
  const ToggleIcon = width === 'full' ? RectangleHorizontal : Columns2;
  const toggleLabel =
    width === 'full'
      ? 'Mettre les onglets ouverts sur une demi-ligne'
      : 'Mettre les onglets ouverts sur une ligne complète';

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="tabs-h"
    >
      <SectionHeader
        id="tabs-h"
        icon={Globe}
        title="Onglets ouverts"
        count={tabs.length}
        accent="sky"
        actions={
          <IconButton
            variant="square"
            label={toggleLabel}
            tooltip={width === 'full' ? 'Demi-ligne' : 'Pleine largeur'}
            tooltipSide="bottom"
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            icon={<ToggleIcon size={16} aria-hidden />}
          />
        }
      />


      {loading ? (
        <p className="text-base text-ink-500 dark:text-ink-300">Chargement…</p>
      ) : tabs.length === 0 ? (
        <p className="text-base text-ink-500 dark:text-ink-300">
          Aucun onglet ne correspond.
        </p>
      ) : (
        <ul className="relative grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2.5">
          {tabs.map((tab) => (
            <DraggableTab
              key={tab.id}
              tab={tab}
              groups={groups}
              groupDotById={groupDotById}
              onActivate={onActivate}
              onClose={onClose}
              onPin={onPinTab}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
