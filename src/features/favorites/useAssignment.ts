import { useCallback, useState } from 'react';
import type { Tab } from '../tabs/useTabs';
import type {
  AssignTarget,
  Bookmark,
  BookmarksApi,
  Group,
} from './useBookmarks';

const NEW_GROUP_NAME = 'Nouveau groupe';

export type DragSource =
  | { type: 'tab'; tab: Tab }
  | { type: 'bookmark'; bookmark: Bookmark };

export type DropTarget =
  | { type: 'favorites-root' }
  | { type: 'group'; groupId: string }
  | { type: 'bookmark'; bookmark: Bookmark }
  | { type: 'placeholder' };

export type DropPosition = { parentId: string; index: number };

function findGroup(api: BookmarksApi, id: string): Group | undefined {
  return api.groups.find((g) => g.id === id);
}

function rootInsertIndex(api: BookmarksApi): number {
  const rootItems = api.favoriteItems.filter(
    (b) => b.parentId === api.favoritesRootId,
  );
  const lastItem = rootItems.at(-1);
  return lastItem ? lastItem.index + 1 : 0;
}

/**
 * Résout la position cible d'un drop en fonction du DropTarget courant.
 * Retourne null pour les cibles non gérables (placeholder, etc.) — l'appelant
 * doit traiter ces cas séparément (création de groupe).
 */
export function resolveDropPosition(
  target: DropTarget | undefined,
  api: BookmarksApi,
): DropPosition | null {
  if (!target) return null;
  if (target.type === 'favorites-root') {
    return { parentId: api.favoritesRootId, index: rootInsertIndex(api) };
  }
  if (target.type === 'group') {
    const group = findGroup(api, target.groupId);
    return { parentId: target.groupId, index: group?.items.length ?? 0 };
  }
  if (target.type === 'bookmark') {
    const { bookmark } = target;
    if (
      api.rootBookmarkFolderIds.includes(bookmark.parentId) ||
      findGroup(api, bookmark.parentId)
    ) {
      return { parentId: bookmark.parentId, index: bookmark.index };
    }
    return { parentId: api.favoritesRootId, index: rootInsertIndex(api) };
  }
  return null;
}

export type AssignmentApi = {
  autoEditId: string | null;
  clearAutoEdit: () => void;
  createEmptyGroup: () => Promise<void>;
  createGroupFromDrop: (source: DragSource) => Promise<void>;
  assignBookmark: (bookmarkId: string, target: AssignTarget) => Promise<void>;
  pinTab: (tab: Tab, target: AssignTarget) => Promise<void>;
};

export function useAssignment(bookmarksApi: BookmarksApi): AssignmentApi {
  const [autoEditId, setAutoEditId] = useState<string | null>(null);
  const clearAutoEdit = useCallback(() => setAutoEditId(null), []);

  const createEmptyGroup = useCallback(async () => {
    const newId = await bookmarksApi.addGroup(NEW_GROUP_NAME);
    if (newId) setAutoEditId(newId);
  }, [bookmarksApi]);

  const createGroupFromDrop = useCallback(
    async (source: DragSource) => {
      const newId = await bookmarksApi.addGroup(NEW_GROUP_NAME);
      if (!newId) return;
      if (source.type === 'tab') {
        await bookmarksApi.addBookmark(newId, {
          title: source.tab.title,
          url: source.tab.url,
        });
      } else {
        await bookmarksApi.moveBookmark(source.bookmark.id, newId, 0);
      }
      setAutoEditId(newId);
    },
    [bookmarksApi],
  );

  const assignBookmark = useCallback(
    async (bookmarkId: string, target: AssignTarget) => {
      if (target.type === 'new-group') {
        const newId = await bookmarksApi.addGroup(NEW_GROUP_NAME);
        if (!newId) return;
        await bookmarksApi.moveBookmark(bookmarkId, newId, 0);
        setAutoEditId(newId);
        return;
      }
      if (target.type === 'group') {
        const group = findGroup(bookmarksApi, target.groupId);
        await bookmarksApi.moveBookmark(
          bookmarkId,
          target.groupId,
          group?.items.length ?? 0,
        );
        return;
      }
      await bookmarksApi.moveBookmark(
        bookmarkId,
        bookmarksApi.favoritesRootId,
        rootInsertIndex(bookmarksApi),
      );
    },
    [bookmarksApi],
  );

  const pinTab = useCallback(
    async (tab: Tab, target: AssignTarget) => {
      if (target.type === 'new-group') {
        const newId = await bookmarksApi.addGroup(NEW_GROUP_NAME);
        if (!newId) return;
        await bookmarksApi.addBookmark(newId, {
          title: tab.title,
          url: tab.url,
        });
        setAutoEditId(newId);
        return;
      }
      const parentId =
        target.type === 'group' ? target.groupId : bookmarksApi.favoritesRootId;
      await bookmarksApi.addBookmark(parentId, {
        title: tab.title,
        url: tab.url,
      });
    },
    [bookmarksApi],
  );

  return {
    autoEditId,
    clearAutoEdit,
    createEmptyGroup,
    createGroupFromDrop,
    assignBookmark,
    pinTab,
  };
}
