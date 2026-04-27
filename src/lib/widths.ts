import { useCallback, useEffect, useState } from 'react';

export type BlockWidth = 'full' | 'half';

const isWidth = (v: unknown): v is BlockWidth => v === 'full' || v === 'half';

export function useBlockWidth(
  storageKey: string,
  defaultWidth: BlockWidth,
): [BlockWidth, () => void] {
  const [width, setWidth] = useState<BlockWidth>(() => {
    if (typeof localStorage === 'undefined') return defaultWidth;
    const stored = localStorage.getItem(storageKey);
    return isWidth(stored) ? stored : defaultWidth;
  });

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(storageKey, width);
  }, [storageKey, width]);

  const toggle = useCallback(
    () => setWidth((w) => (w === 'full' ? 'half' : 'full')),
    [],
  );

  return [width, toggle];
}

export type BlockWidthMap = {
  getWidth: (id: string) => BlockWidth;
  toggle: (id: string) => void;
};

export function useBlockWidthMap(
  storageKey: string,
  defaultWidth: BlockWidth,
): BlockWidthMap {
  const [map, setMap] = useState<Record<string, BlockWidth>>(() => {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      const result: Record<string, BlockWidth> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (isWidth(v)) result[k] = v;
      }
      return result;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(map));
  }, [storageKey, map]);

  const getWidth = useCallback(
    (id: string): BlockWidth => map[id] ?? defaultWidth,
    [map, defaultWidth],
  );

  const toggle = useCallback(
    (id: string) =>
      setMap((prev) => ({
        ...prev,
        [id]: (prev[id] ?? defaultWidth) === 'half' ? 'full' : 'half',
      })),
    [defaultWidth],
  );

  return { getWidth, toggle };
}
