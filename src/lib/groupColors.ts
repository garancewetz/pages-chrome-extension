import { useCallback, useEffect, useState } from 'react';

export type GroupColorId =
  | 'violet'
  | 'rose'
  | 'sky'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'fuchsia';

export type GroupColor = {
  id: GroupColorId;
  label: string;
  dot: string;
};

// Palette ancrée sur les couleurs de marque (violet, rose, sky, amber de
// tailwind.config) + 3 harmoniques (corail, sauge, mauve) pour étaler la roue.
// Saturation ~65 %, lightness ~60 % — vif et chaleureux, sans être criard.
export const GROUP_COLORS: GroupColor[] = [
  { id: 'indigo', label: 'Corail', dot: '#e07a55' },
  { id: 'amber', label: 'Ambre', dot: '#e0a93d' },
  { id: 'emerald', label: 'Sauge', dot: '#5fbb86' },
  { id: 'sky', label: 'Bleu', dot: '#3fa8d6' },
  { id: 'violet', label: 'Lavande', dot: '#876fd9' },
  { id: 'fuchsia', label: 'Mauve', dot: '#d679c2' },
  { id: 'rose', label: 'Rose', dot: '#db6c8d' },
];

const ID_SET = new Set<GroupColorId>(GROUP_COLORS.map((c) => c.id));
const isColorId = (v: unknown): v is GroupColorId =>
  typeof v === 'string' && ID_SET.has(v as GroupColorId);

export function getColor(id: GroupColorId): GroupColor {
  return GROUP_COLORS.find((c) => c.id === id) ?? GROUP_COLORS[0];
}

export type GroupColorMap = {
  getColorId: (groupId: string, index: number) => GroupColorId;
  setColorId: (groupId: string, color: GroupColorId) => void;
};

export function useGroupColorMap(storageKey: string): GroupColorMap {
  const [map, setMap] = useState<Record<string, GroupColorId>>(() => {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      const result: Record<string, GroupColorId> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (isColorId(v)) result[k] = v;
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

  const getColorId = useCallback(
    (groupId: string, index: number): GroupColorId =>
      map[groupId] ?? GROUP_COLORS[index % GROUP_COLORS.length].id,
    [map],
  );

  const setColorId = useCallback(
    (groupId: string, color: GroupColorId) =>
      setMap((prev) => ({ ...prev, [groupId]: color })),
    [],
  );

  return { getColorId, setColorId };
}
