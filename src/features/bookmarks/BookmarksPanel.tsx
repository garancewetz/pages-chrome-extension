import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { useBookmarks } from './useBookmarks';

type BookmarksPanelProps = { filter: string };

export function BookmarksPanel({ filter }: BookmarksPanelProps) {
  const { bookmarks, loading } = useBookmarks();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q
      ? bookmarks.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.url.toLowerCase().includes(q),
        )
      : bookmarks;
    return list.slice(0, 50);
  }, [bookmarks, filter]);

  return (
    <Card title={`Favoris (${filtered.length})`}>
      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun favori trouvé.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((b) => (
            <li key={b.id}>
              <a
                href={b.url}
                className="block truncate rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-accent-bg"
                title={b.url}
              >
                {b.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
