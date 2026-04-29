import { useCallback, useEffect, useState } from 'react';
import { isExtension } from '../../lib/chrome';

/** IDs par défaut Chromium — sur certains profils la barre / Autres favoris n’ont pas 1 et 2. */
const DEFAULT_BAR_ID = '1';
const DEFAULT_OTHER_ID = '2';
const BOOKMARK_ROOT_ID = '0';

function isBookmarkBarTitle(title: string | undefined): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  return (
    t === 'bookmarks bar' ||
    t === 'barre des favoris' ||
    t === 'lesezeichenleiste' ||
    t === 'barra de marcadores' ||
    t === 'barra dei segnalibri' ||
    t === 'barre des signets' ||
    t === 'bladwijzerbalk' ||
    t === 'pasek zakładek' ||
    (t.includes('bookmark') && t.endsWith(' bar')) ||
    (t.includes('barre') && t.includes('favoris')) ||
    (t.includes('barra') && t.includes('marcador'))
  );
}

function isOtherBookmarksTitle(title: string | undefined): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  return (
    t === 'other bookmarks' ||
    t === 'autres favoris' ||
    t === 'weitere lesezeichen' ||
    t === 'otros marcadores' ||
    t === 'altri segnalibri' ||
    t === 'andre bogmærker' ||
    t === 'övriga bokmärken' ||
    t === 'その他のブックマーク' ||
    (t.includes('other') && t.includes('bookmark')) ||
    (t.includes('autres') && t.includes('favoris'))
  );
}

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

/** Cible pour assigner un favori ou épingler un onglet sans drag. */
export type AssignTarget =
  | { type: 'root' }
  | { type: 'group'; groupId: string }
  | { type: 'new-group' };

type BookmarkModel = {
  favoriteItems: Bookmark[];
  groups: Group[];
};

export type BookmarkSnapshot = {
  title: string;
  url: string;
  parentId: string;
  index: number;
};

export type GroupSnapshot = {
  name: string;
  parentId: string;
  index: number;
  items: { title: string; url: string }[];
};

export type BookmarksApi = BookmarkModel & {
  loaded: boolean;
  /** ID Chrome du dossier « barre des favoris » (création de groupes, drop racine). */
  favoritesRootId: string;
  /** Tous les dossiers racine du profil (barre, autres, mobile, géré, …) — repères pour le DnD. */
  rootBookmarkFolderIds: readonly string[];
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
  restoreBookmark: (snapshot: BookmarkSnapshot) => Promise<void>;
  restoreGroup: (snapshot: GroupSnapshot) => Promise<void>;
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

/**
 * Résout le dossier système « barre des favoris ».
 * Ne pas supposer des IDs fixes : sync, import ou Chrome géré peuvent changer l’arbre.
 */
function resolveBarRoot(
  tree: chrome.bookmarks.BookmarkTreeNode[],
): chrome.bookmarks.BookmarkTreeNode | undefined {
  const root = tree[0];
  if (!root?.children?.length) return undefined;

  const folders = root.children.filter((n) => !n.url);
  const id1 = findNode(tree, DEFAULT_BAR_ID);
  const id2 = findNode(tree, DEFAULT_OTHER_ID);
  if (
    id1 &&
    id2 &&
    !id1.url &&
    !id2.url &&
    id1.parentId === BOOKMARK_ROOT_ID &&
    id2.parentId === BOOKMARK_ROOT_ID
  ) {
    return id1;
  }

  const byBarTitle = folders.find((n) => isBookmarkBarTitle(n.title));
  const byOtherTitle = folders.find((n) => isOtherBookmarksTitle(n.title));
  if (byBarTitle && byOtherTitle) return byBarTitle;

  if (folders.length === 2) return folders[0];

  // Souvent : [Signets gérés, Barre, Autres] sous Chrome entreprise
  if (folders.length >= 3) return folders[1];

  return byBarTitle ?? folders[0];
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

/** Dossiers conteneurs sous la racine Chrome (0) : barre, autres, mobile, signets gérés, etc. */
function getProfileContainerRoots(
  tree: chrome.bookmarks.BookmarkTreeNode[],
): chrome.bookmarks.BookmarkTreeNode[] {
  const root = tree[0];
  return (root?.children ?? [])
    .filter((n) => !n.url)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

/**
 * Un dossier Chrome = une section (groupe) ; les sous-dossiers = sections séparées avec fil d’Ariane.
 * Les URLs directement sous la barre / Autres / Mobile / … restent en « favoris directs ».
 */
function walkFolderTree(
  folder: chrome.bookmarks.BookmarkTreeNode,
  groups: Group[],
  ancestorTitles: string[],
): void {
  const title = folder.title?.trim() || 'Dossier';
  const chain = [...ancestorTitles, title];
  const displayName = chain.join(' › ');

  const directUrls: Bookmark[] = [];
  const subfolders: chrome.bookmarks.BookmarkTreeNode[] = [];
  for (const c of folder.children ?? []) {
    if (c.url) directUrls.push(toBookmark(c));
    else subfolders.push(c);
  }
  subfolders.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  // Affiche le dossier s'il contient des URLs, ou s'il est feuille (vide).
  // Un dossier qui ne contient que des sous-dossiers reste masqué : ses
  // sous-dossiers apparaîtront comme groupes séparés via la récursion.
  if (directUrls.length > 0 || subfolders.length === 0) {
    groups.push({
      id: folder.id,
      name: displayName,
      parentId: folder.parentId ?? '',
      index: folder.index ?? 0,
      items: directUrls,
    });
  }

  for (const sub of subfolders) {
    walkFolderTree(sub, groups, chain);
  }
}

function buildModel(tree: chrome.bookmarks.BookmarkTreeNode[]): BookmarkModel {
  const favoriteItems: Bookmark[] = [];
  const groups: Group[] = [];
  const containers = getProfileContainerRoots(tree);

  for (const container of containers) {
    const kids = [...(container.children ?? [])].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0),
    );
    for (const child of kids) {
      if (child.url) {
        favoriteItems.push(toBookmark(child));
      } else {
        walkFolderTree(child, groups, []);
      }
    }
  }

  return { favoriteItems, groups };
}

export function useBookmarks(): BookmarksApi {
  const [favoriteItems, setFavoriteItems] = useState<Bookmark[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [favoritesRootId, setFavoritesRootId] = useState(DEFAULT_BAR_ID);
  const [rootBookmarkFolderIds, setRootBookmarkFolderIds] = useState<
    readonly string[]
  >([DEFAULT_BAR_ID, DEFAULT_OTHER_ID]);

  const refresh = useCallback(() => {
    if (!isExtension) {
      setFavoriteItems([]);
      setGroups([]);
      setFavoritesRootId(DEFAULT_BAR_ID);
      setRootBookmarkFolderIds([DEFAULT_BAR_ID, DEFAULT_OTHER_ID]);
      setLoaded(true);
      return;
    }
    void chrome.bookmarks
      .getTree()
      .then((tree) => {
        const bar = resolveBarRoot(tree);
        const containers = getProfileContainerRoots(tree);
        setFavoritesRootId(bar?.id ?? DEFAULT_BAR_ID);
        setRootBookmarkFolderIds(containers.map((n) => n.id));
        const model = buildModel(tree);
        setFavoriteItems(model.favoriteItems);
        setGroups(model.groups);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('[mosaic] getTree failed', err);
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
          parentId: favoritesRootId,
          title: name,
        });
        return node.id;
      } catch (err) {
        console.error('[mosaic] addGroup failed', { name, err });
        return undefined;
      }
    },
    [favoritesRootId],
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

  const restoreBookmark = useCallback(
    async (snapshot: BookmarkSnapshot): Promise<void> => {
      if (!isExtension) return;
      try {
        await chrome.bookmarks.create({
          parentId: snapshot.parentId,
          title: snapshot.title,
          url: snapshot.url,
          index: snapshot.index,
        });
      } catch (err) {
        console.error('[mosaic] restoreBookmark failed', { snapshot, err });
      }
    },
    [],
  );

  const restoreGroup = useCallback(
    async (snapshot: GroupSnapshot): Promise<void> => {
      if (!isExtension) return;
      try {
        const folder = await chrome.bookmarks.create({
          parentId: snapshot.parentId,
          title: snapshot.name,
          index: snapshot.index,
        });
        for (const item of snapshot.items) {
          await chrome.bookmarks.create({
            parentId: folder.id,
            title: item.title,
            url: item.url,
          });
        }
      } catch (err) {
        console.error('[mosaic] restoreGroup failed', { snapshot, err });
      }
    },
    [],
  );

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
    favoritesRootId,
    rootBookmarkFolderIds,
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
    restoreBookmark,
    restoreGroup,
  };
}
