import { Globe } from 'lucide-react';
import { DraggableTabRow } from './TabRow';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { normalizeUrl } from '../../lib/url';
import type { PinnedRef } from '../../App';
import type { AssignTarget, Group } from '../favorites/useBookmarks';
import type { Tab } from './useTabs';

type Props = {
  tabs: Tab[];
  loading: boolean;
  groups: Group[];
  groupDotById: Record<string, string>;
  pinnedByUrl: Map<string, PinnedRef>;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onPinTab: (tab: Tab, target: AssignTarget) => void;
};

export function TabsSidePanel({
  tabs,
  loading,
  groups,
  groupDotById,
  pinnedByUrl,
  onActivate,
  onClose,
  onPinTab,
}: Props) {
  return (
    <aside
      aria-labelledby="tabs-side-h"
      className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-3 border-r-2 border-ink-200 bg-white/40 px-3 py-4 backdrop-blur-sm dark:border-ink-700/70 dark:bg-ink-900/50"
    >
      <SectionHeader
        id="tabs-side-h"
        icon={Globe}
        title="Onglets ouverts"
        count={tabs.length}
        accent="sky"
      />

      {loading ? (
        <p className="text-base text-ink-600 dark:text-ink-200">Chargement…</p>
      ) : tabs.length === 0 ? (
        <p className="text-base text-ink-600 dark:text-ink-200">
          Aucun onglet ne correspond.
        </p>
      ) : (
        <ul className="-mr-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {tabs.map((tab) => (
            <DraggableTabRow
              key={tab.id}
              tab={tab}
              groups={groups}
              groupDotById={groupDotById}
              pinnedTo={pinnedByUrl.get(normalizeUrl(tab.url)) ?? null}
              onActivate={onActivate}
              onClose={onClose}
              onPin={onPinTab}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
