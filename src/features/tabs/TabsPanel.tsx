import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTabs, type Tab } from './useTabs';

type TabsPanelProps = { filter: string };

export function TabsPanel({ filter }: TabsPanelProps) {
  const { tabs, loading, activate, close } = useTabs();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q),
    );
  }, [tabs, filter]);

  return (
    <Card
      title={`Onglets (${filtered.length})`}
      action={<span className="text-xs text-muted">en direct</span>}
    >
      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun onglet ne correspond.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((t) => (
            <TabRow key={t.id} tab={t} onActivate={activate} onClose={close} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function TabRow({
  tab,
  onActivate,
  onClose,
}: {
  tab: Tab;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
}) {
  return (
    <li className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent-bg">
      <button
        type="button"
        onClick={() => onActivate(tab)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        {tab.favIconUrl ? (
          <img
            src={tab.favIconUrl}
            alt=""
            className="h-4 w-4 flex-shrink-0 rounded"
          />
        ) : (
          <span className="h-4 w-4 flex-shrink-0 rounded bg-border" />
        )}
        <span className="truncate text-sm text-ink">{tab.title}</span>
      </button>
      <Button
        aria-label="Fermer l'onglet"
        onClick={() => onClose(tab)}
        className="opacity-0 group-hover:opacity-100"
      >
        ✕
      </Button>
    </li>
  );
}
