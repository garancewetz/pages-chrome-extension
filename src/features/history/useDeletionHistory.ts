import { useCallback, useEffect, useState } from 'react';
import type {
  BookmarkSnapshot,
  GroupSnapshot,
} from '../favorites/useBookmarks';

const STORAGE_KEY = 'mosaic.deletionHistory';
const MAX_ENTRIES = 50;

export type BookmarkDeletion = {
  kind: 'bookmark';
  id: string;
  deletedAt: number;
  snapshot: BookmarkSnapshot;
};

export type GroupDeletion = {
  kind: 'group';
  id: string;
  deletedAt: number;
  snapshot: GroupSnapshot;
};

export type DeletionEntry = BookmarkDeletion | GroupDeletion;

function isBookmarkSnapshot(value: unknown): value is BookmarkSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === 'string' &&
    typeof v.url === 'string' &&
    typeof v.parentId === 'string' &&
    typeof v.index === 'number'
  );
}

function isGroupSnapshot(value: unknown): value is GroupSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.name !== 'string' ||
    typeof v.parentId !== 'string' ||
    typeof v.index !== 'number'
  )
    return false;
  if (!Array.isArray(v.items)) return false;
  return v.items.every(
    (it) =>
      it &&
      typeof it === 'object' &&
      typeof (it as Record<string, unknown>).title === 'string' &&
      typeof (it as Record<string, unknown>).url === 'string',
  );
}

function isEntry(value: unknown): value is DeletionEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || typeof v.deletedAt !== 'number') return false;
  if (v.kind === 'bookmark') return isBookmarkSnapshot(v.snapshot);
  if (v.kind === 'group') return isGroupSnapshot(v.snapshot);
  return false;
}

function readEntries(): DeletionEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

function writeEntries(entries: DeletionEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('[mosaic] writeEntries failed', err);
  }
}

export type DeletionHistoryApi = {
  entries: DeletionEntry[];
  recordBookmark: (id: string, snapshot: BookmarkSnapshot) => void;
  recordGroup: (id: string, snapshot: GroupSnapshot) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export function useDeletionHistory(): DeletionHistoryApi {
  const [entries, setEntries] = useState<DeletionEntry[]>(() => readEntries());

  // Sync entre onglets : si un autre onglet ajoute une entrée, on la voit ici.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setEntries(readEntries());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next: DeletionEntry[]) => {
    setEntries(next);
    writeEntries(next);
  }, []);

  const recordBookmark = useCallback<DeletionHistoryApi['recordBookmark']>(
    (id, snapshot) => {
      setEntries((prev) => {
        const entry: BookmarkDeletion = {
          kind: 'bookmark',
          id,
          deletedAt: Date.now(),
          snapshot,
        };
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        writeEntries(next);
        return next;
      });
    },
    [],
  );

  const recordGroup = useCallback<DeletionHistoryApi['recordGroup']>(
    (id, snapshot) => {
      setEntries((prev) => {
        const entry: GroupDeletion = {
          kind: 'group',
          id,
          deletedAt: Date.now(),
          snapshot,
        };
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        writeEntries(next);
        return next;
      });
    },
    [],
  );

  const remove = useCallback<DeletionHistoryApi['remove']>(
    (id) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist],
  );

  const clear = useCallback<DeletionHistoryApi['clear']>(() => {
    persist([]);
  }, [persist]);

  return { entries, recordBookmark, recordGroup, remove, clear };
}
