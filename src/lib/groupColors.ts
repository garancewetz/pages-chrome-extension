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
// Saturation ~50 %, lightness ~63 % — vif sans être criard.
export const GROUP_COLORS: GroupColor[] = [
  { id: 'indigo', label: 'Corail', dot: '#d6896d' },
  { id: 'amber', label: 'Ambre', dot: '#d6a558' },
  { id: 'emerald', label: 'Sauge', dot: '#7eb593' },
  { id: 'sky', label: 'Bleu', dot: '#5fadd0' },
  { id: 'violet', label: 'Lavande', dot: '#9582d0' },
  { id: 'fuchsia', label: 'Mauve', dot: '#cf8bbf' },
  { id: 'rose', label: 'Rose', dot: '#d6839a' },
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
