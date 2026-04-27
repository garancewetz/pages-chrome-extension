import { Columns2, Globe, RectangleHorizontal } from 'lucide-react';
import type { Tab } from './useTabs';
import { DraggableTab } from './DraggableTab';
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
  const ToggleIcon = width === 'full' ? Columns2 : RectangleHorizontal;
  const toggleLabel =
    width === 'full'
      ? 'Mettre les onglets ouverts sur une demi-ligne'
      : 'Mettre les onglets ouverts sur une ligne complète';

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tabs-h">
      <header className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md">
          <Globe size={18} aria-hidden />
        </span>
        <h2
          id="tabs-h"
          className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-xl font-semibold text-transparent dark:from-sky-300 dark:to-cyan-200"
        >
          Onglets ouverts
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400" aria-hidden>
          {tabs.length}
        </span>
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={width === 'half'}
          onClick={onToggleWidth}
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-slate-700 backdrop-blur-md transition-colors hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
        >
          <ToggleIcon size={16} aria-hidden />
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : tabs.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun onglet ne correspond.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3 p-2">
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
