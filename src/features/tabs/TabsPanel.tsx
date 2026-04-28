import { Columns2, Globe, RectangleHorizontal } from 'lucide-react';
import type { Tab } from './useTabs';
import { DraggableTab } from './DraggableTab';
import { IconButton } from '../../components/ui/IconButton';
import type { BlockWidth } from '../../lib/widths';

type TabsPanelProps = {
  tabs: Tab[];
  loading: boolean;
  width: BlockWidth;
  onToggleWidth: () => void;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
};

export function TabsPanel({
  tabs,
  loading,
  width,
  onToggleWidth,
  onActivate,
  onClose,
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
      <header className="flex items-center gap-2">
        <Globe size={15} className="shrink-0 text-ink-400 dark:text-ink-500" aria-hidden />
        <h2
          id="tabs-h"
          className="font-display text-base font-semibold text-ink-700 dark:text-ink-100"
        >
          Onglets ouverts
        </h2>
        <span
          className="ml-0.5 text-sm text-ink-400 dark:text-ink-300"
          aria-hidden
        >
          {tabs.length}
        </span>
        <span className="ml-auto">
          <IconButton
            variant="square"
            label={toggleLabel}
            tooltip={width === 'full' ? 'Demi-ligne' : 'Pleine largeur'}
            tooltipSide="bottom"
            aria-pressed={width === 'half'}
            onClick={onToggleWidth}
            icon={<ToggleIcon size={16} aria-hidden />}
          />
        </span>
      </header>

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
              onActivate={onActivate}
              onClose={onClose}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
