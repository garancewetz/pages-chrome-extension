import { useDndContext } from '@dnd-kit/core';

export type ActiveDragType = 'tab' | 'bookmark' | 'block' | null;

export function useActiveDragType(): ActiveDragType {
  const { active } = useDndContext();
  const type = active?.data.current?.type;
  if (type === 'tab' || type === 'bookmark' || type === 'block') return type;
  return null;
}

export function isBookmarkDropTarget(type: ActiveDragType): boolean {
  return type === 'tab' || type === 'bookmark';
}
