import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SearchBar } from './components/ui/SearchBar';
import { FavoritesPanel } from './features/favorites/FavoritesPanel';
import { TabsPanel } from './features/tabs/TabsPanel';
import { NotesPanel } from './features/notes/NotesPanel';
import { TabPreview } from './features/tabs/DraggableTab';
import { BookmarkPreview } from './features/favorites/BookmarkTile';
import { useTabs, type Tab } from './features/tabs/useTabs';
import {
  FAVORITES_ROOT_ID,
  useBookmarks,
  type Bookmark,
  type BookmarksApi,
  type Group,
} from './features/favorites/useBookmarks';
import { useBlockWidth, useBlockWidthMap } from './lib/widths';

type DragSource =
  | { type: 'tab'; tab: Tab }
  | { type: 'bookmark'; bookmark: Bookmark };

type DropTarget =
  | { type: 'favorites-root' }
  | { type: 'group'; groupId: string }
  | { type: 'bookmark'; bookmark: Bookmark }
  | { type: 'placeholder' };

type DropPosition = { parentId: string; index: number };

const TAB_DRAG_PREFIX = 'tab:';
const NEW_GROUP_NAME = 'Nouveau groupe';

function buildMatcher(query: string): (title: string, url: string) => boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return () => true;
  return (title, url) =>
    title.toLowerCase().includes(trimmed) ||
    url.toLowerCase().includes(trimmed);
}

function findBookmark(api: BookmarksApi, id: string): Bookmark | undefined {
  const inFav = api.favoriteItems.find((b) => b.id === id);
  if (inFav) return inFav;
  for (const g of api.groups) {
    const hit = g.items.find((b) => b.id === id);
    if (hit) return hit;
  }
  return undefined;
}

function findGroup(api: BookmarksApi, id: string): Group | undefined {
  return api.groups.find((g) => g.id === id);
}

function resolveDropPosition(
  target: DropTarget | undefined,
  api: BookmarksApi,
): DropPosition | null {
  if (!target) return null;
  if (target.type === 'favorites-root') {
    return { parentId: FAVORITES_ROOT_ID, index: api.favoriteItems.length };
  }
  if (target.type === 'group') {
    const group = findGroup(api, target.groupId);
    return { parentId: target.groupId, index: group?.items.length ?? 0 };
  }
  if (target.type === 'bookmark') {
    const { bookmark } = target;
    const siblings =
      bookmark.parentId === FAVORITES_ROOT_ID
        ? api.favoriteItems
        : (findGroup(api, bookmark.parentId)?.items ?? null);
    if (siblings) {
      const idx = siblings.findIndex((b) => b.id === bookmark.id);
      return { parentId: bookmark.parentId, index: Math.max(idx, 0) };
    }
    return {
      parentId: FAVORITES_ROOT_ID,
      index: api.favoriteItems.length,
    };
  }
  return null;
}

export default function App() {
  const [filter, setFilter] = useState('');
  const tabsApi = useTabs();
  const bookmarksApi = useBookmarks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [autoEditId, setAutoEditId] = useState<string | null>(null);
  const [tabsWidth, toggleTabsWidth] = useBlockWidth(
    'mosaic.tabsWidth',
    'full',
  );
  const [notesWidth, toggleNotesWidth] = useBlockWidth(
    'mosaic.notesWidth',
    'full',
  );
  const groupWidths = useBlockWidthMap('mosaic.groupWidths', 'half');

  const filteredTabs = useMemo(() => {
    const matches = buildMatcher(filter);
    return tabsApi.tabs.filter((t) => matches(t.title, t.url));
  }, [tabsApi.tabs, filter]);

  const filteredFavoriteItems = useMemo(() => {
    const matches = buildMatcher(filter);
    return bookmarksApi.favoriteItems.filter((b) => matches(b.title, b.url));
  }, [bookmarksApi.favoriteItems, filter]);

  const filteredGroups = useMemo<Group[]>(() => {
    if (!filter.trim()) return bookmarksApi.groups;
    const matches = buildMatcher(filter);
    return bookmarksApi.groups
      .map((g) => ({
        ...g,
        items: g.items.filter((b) => matches(b.title, b.url)),
      }))
      .filter((g) => g.items.length > 0);
  }, [bookmarksApi.groups, filter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetection: CollisionDetection = (args) => closestCenter(args);

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(String(event.active.id));
  };

  const handleDragCancel = (): void => setActiveId(null);

  const createGroupFromDrop = async (source: DragSource): Promise<void> => {
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
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const source = active.data.current as DragSource | undefined;
    if (!source) return;
    const target = over.data.current as DropTarget | undefined;

    if (target?.type === 'placeholder') {
      void createGroupFromDrop(source);
      return;
    }

    const destination = resolveDropPosition(target, bookmarksApi);
    if (!destination) return;

    if (source.type === 'tab') {
      void bookmarksApi.addBookmark(destination.parentId, {
        title: source.tab.title,
        url: source.tab.url,
      });
      return;
    }

    if (source.bookmark.id === String(over.id)) return;
    void bookmarksApi.moveBookmark(
      source.bookmark.id,
      destination.parentId,
      destination.index,
    );
  };

  const activeTab = useMemo<Tab | null>(() => {
    if (!activeId?.startsWith(TAB_DRAG_PREFIX)) return null;
    return (
      tabsApi.tabs.find((t) => `${TAB_DRAG_PREFIX}${t.id}` === activeId) ?? null
    );
  }, [activeId, tabsApi.tabs]);

  const activeBookmark = useMemo<Bookmark | null>(() => {
    if (!activeId) return null;
    if (activeId.startsWith(TAB_DRAG_PREFIX)) return null;
    return findBookmark(bookmarksApi, activeId) ?? null;
  }, [activeId, bookmarksApi]);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo />
          <h1 className="bg-gradient-to-r from-violet-600 via-rose-500 to-sky-500 bg-clip-text text-2xl font-semibold text-transparent dark:from-violet-300 dark:via-rose-300 dark:to-sky-300">
            Mosaic
          </h1>
        </div>
        <div className="md:w-80">
          <SearchBar
            value={filter}
            onChange={setFilter}
            placeholder="Rechercher dans les favoris et onglets…"
          />
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="flex flex-col gap-8">
          {!bookmarksApi.loaded ? (
            <p className="text-base text-slate-500">Chargement…</p>
          ) : (
            <>
              <FavoritesPanel
                items={filteredFavoriteItems}
                groups={filteredGroups}
                groupWidths={groupWidths}
                autoEditId={autoEditId}
                onAutoEditDone={() => setAutoEditId(null)}
                onRemoveBookmark={bookmarksApi.removeBookmark}
                onRenameGroup={bookmarksApi.renameGroup}
                onRemoveGroup={bookmarksApi.removeGroup}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div
                  className={
                    tabsWidth === 'half' ? 'md:col-span-1' : 'md:col-span-2'
                  }
                >
                  <TabsPanel
                    tabs={filteredTabs}
                    loading={tabsApi.loading}
                    width={tabsWidth}
                    onToggleWidth={toggleTabsWidth}
                    onActivate={tabsApi.activate}
                    onClose={tabsApi.close}
                  />
                </div>
                <div
                  className={
                    notesWidth === 'half' ? 'md:col-span-1' : 'md:col-span-2'
                  }
                >
                  <NotesPanel
                    width={notesWidth}
                    onToggleWidth={toggleNotesWidth}
                  />
                </div>
              </div>
            </>
          )}
        </main>

        <DragOverlay dropAnimation={null}>
          {activeTab ? (
            <TabPreview tab={activeTab} />
          ) : activeBookmark ? (
            <BookmarkPreview bookmark={activeBookmark} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="h-7 w-7 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="logo-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="logo-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="logo-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="32" height="56" rx="8" fill="url(#logo-violet)" />
      <rect x="40" y="4" width="20" height="26" rx="6" fill="url(#logo-rose)" />
      <rect x="40" y="34" width="20" height="26" rx="6" fill="url(#logo-sky)" />
    </svg>
  );
}
