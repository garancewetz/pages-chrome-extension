import { useCallback, useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

export const FAVORITES_ROOT_ID = '1';
const OUTSIDE_ROOT_ID = '2';

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  parentId: string;
  index: number;
};

export type Group = {
  id: string;
  name: string;
  parentId: string;
  index: number;
  items: Bookmark[];
};

type BookmarkModel = {
  favoriteItems: Bookmark[];
  groups: Group[];
};

export type BookmarksApi = BookmarkModel & {
  loaded: boolean;
  addGroup: (name: string) => Promise<string | undefined>;
  renameGroup: (id: string, name: string) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  moveGroup: (id: string, direction: 'up' | 'down') => Promise<void>;
  addBookmark: (
    parentId: string,
    input: { title: string; url: string },
  ) => Promise<void>;
  renameBookmark: (id: string, title: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  moveBookmark: (
    id: string,
    toParentId: string,
    toIndex: number,
  ) => Promise<void>;
};

function findNode(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  id: string,
): chrome.bookmarks.BookmarkTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function toBookmark(node: chrome.bookmarks.BookmarkTreeNode): Bookmark {
  return {
    id: node.id,
    title: node.title || node.url || '(sans titre)',
    url: node.url ?? '',
    parentId: node.parentId ?? '',
    index: node.index ?? 0,
  };
}

function collectUrls(
  nodes: chrome.bookmarks.BookmarkTreeNode[] | undefined,
  out: Bookmark[],
): void {
  for (const node of nodes ?? []) {
    if (node.url) out.push(toBookmark(node));
    else if (node.children) collectUrls(node.children, out);
  }
}

function buildModel(tree: chrome.bookmarks.BookmarkTreeNode[]): BookmarkModel {
  const favRoot = findNode(tree, FAVORITES_ROOT_ID);
  const outsideRoot = findNode(tree, OUTSIDE_ROOT_ID);

  const favoriteItems: Bookmark[] = [];
  const groups: Group[] = [];

  for (const child of favRoot?.children ?? []) {
    if (child.url) {
      favoriteItems.push(toBookmark(child));
    } else {
      const items: Bookmark[] = [];
      collectUrls(child.children, items);
      groups.push({
        id: child.id,
        name: child.title,
        parentId: child.parentId ?? '',
        index: child.index ?? 0,
        items,
      });
    }
  }

  for (const child of outsideRoot?.children ?? []) {
    if (child.url) {
      favoriteItems.push(toBookmark(child));
    } else {
      const items: Bookmark[] = [];
      collectUrls(child.children, items);
      groups.push({
        id: child.id,
        name: child.title,
        parentId: child.parentId ?? '',
        index: child.index ?? 0,
        items,
      });
    }
  }

  return { favoriteItems, groups };
}

export function useBookmarks(): BookmarksApi {
  const [favoriteItems, setFavoriteItems] = useState<Bookmark[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    if (!isExtension) {
      setFavoriteItems([]);
      setGroups([]);
      setLoaded(true);
      return;
    }
    void chrome.bookmarks.getTree().then((tree) => {
      const model = buildModel(tree);
      setFavoriteItems(model.favoriteItems);
      setGroups(model.groups);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    refresh();
    if (!isExtension) return;

    const handler = () => refresh();
    chrome.bookmarks.onCreated.addListener(handler);
    chrome.bookmarks.onRemoved.addListener(handler);
    chrome.bookmarks.onChanged.addListener(handler);
    chrome.bookmarks.onMoved.addListener(handler);
    return () => {
      chrome.bookmarks.onCreated.removeListener(handler);
      chrome.bookmarks.onRemoved.removeListener(handler);
      chrome.bookmarks.onChanged.removeListener(handler);
      chrome.bookmarks.onMoved.removeListener(handler);
    };
  }, [refresh]);

  const addGroup = useCallback(
    async (name: string): Promise<string | undefined> => {
      if (!isExtension) return undefined;
      try {
        const node = await chrome.bookmarks.create({
          parentId: FAVORITES_ROOT_ID,
          title: name,
        });
        return node.id;
      } catch (err) {
        console.error('[mosaic] addGroup failed', { name, err });
        return undefined;
      }
    },
    [],
  );

  const renameGroup = useCallback(
    async (id: string, name: string): Promise<void> => {
      if (!isExtension) return;
      try {
        await chrome.bookmarks.update(id, { title: name });
      } catch (err) {
        console.error('[mosaic] renameGroup failed', { id, name, err });
      }
    },
    [],
  );

  const removeGroup = useCallback(async (id: string): Promise<void> => {
    if (!isExtension) return;
    try {
      await chrome.bookmarks.removeTree(id);
    } catch (err) {
      console.error('[mosaic] removeGroup failed', { id, err });
    }
  }, []);

  const moveGroup = useCallback(
    async (id: string, direction: 'up' | 'down'): Promise<void> => {
      if (!isExtension) return;
      const idx = groups.findIndex((g) => g.id === id);
      if (idx === -1) return;
      const neighborIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (neighborIdx < 0 || neighborIdx >= groups.length) return;
      const current = groups[idx];
      const neighbor = groups[neighborIdx];

      const sameParent = current.parentId === neighbor.parentId;
      const targetParentId = sameParent ? current.parentId : neighbor.parentId;
      const baseIndex = sameParent
        ? neighbor.index
        : direction === 'up'
          ? neighbor.index
          : neighbor.index + 1;

      // chrome.bookmarks.move retire l'élément avant l'insertion : pour un
      // déplacement dans le même dossier vers un index plus grand, Chrome
      // décrémente l'index passé. On compense ici.
      const adjustedIndex =
        sameParent && baseIndex > current.index ? baseIndex + 1 : baseIndex;

      try {
        await chrome.bookmarks.move(id, {
          parentId: targetParentId,
          index: adjustedIndex,
        });
      } catch (err) {
        console.error('[mosaic] moveGroup failed', { id, direction, err });
      }
    },
    [groups],
  );

  const addBookmark = useCallback(
    async (
      parentId: string,
      input: { title: string; url: string },
    ): Promise<void> => {
      if (!isExtension) return;
      try {
        await chrome.bookmarks.create({
          parentId,
          title: input.title,
          url: input.url,
        });
      } catch (err) {
        console.error('[mosaic] addBookmark failed', { parentId, input, err });
      }
    },
    [],
  );

  const renameBookmark = useCallback(
    async (id: string, title: string): Promise<void> => {
      if (!isExtension) return;
      try {
        await chrome.bookmarks.update(id, { title });
      } catch (err) {
        console.error('[mosaic] renameBookmark failed', { id, title, err });
      }
    },
    [],
  );

  const removeBookmark = useCallback(async (id: string): Promise<void> => {
    if (!isExtension) return;
    try {
      await chrome.bookmarks.remove(id);
    } catch (err) {
      console.error('[mosaic] removeBookmark failed', { id, err });
    }
  }, []);

  const moveBookmark = useCallback(
    async (
      id: string,
      toParentId: string,
      toIndex: number,
    ): Promise<void> => {
      if (!isExtension) return;
      try {
        // chrome.bookmarks.move retire l'élément avant l'insertion : pour un
        // déplacement dans le même dossier vers un index plus grand, Chrome
        // décrémente l'index passé. On compense ici pour que toIndex
        // représente la position finale souhaitée.
        const [node] = await chrome.bookmarks.get(id);
        let adjustedIndex = toIndex;
        if (
          node &&
          node.parentId === toParentId &&
          typeof node.index === 'number' &&
          toIndex > node.index
        ) {
          adjustedIndex = toIndex + 1;
        }
        await chrome.bookmarks.move(id, {
          parentId: toParentId,
          index: adjustedIndex,
        });
      } catch (err) {
        console.error('[mosaic] moveBookmark failed', {
          id,
          toParentId,
          toIndex,
          err,
        });
      }
    },
    [],
  );

  return {
    loaded,
    favoriteItems,
    groups,
    addGroup,
    renameGroup,
    removeGroup,
    moveGroup,
    addBookmark,
    renameBookmark,
    removeBookmark,
    moveBookmark,
  };
}
