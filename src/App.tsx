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
import { GoogleSearch } from './components/GoogleSearch';
import { Logo } from './components/ui/Logo';
import { SearchBar } from './components/ui/SearchBar';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { FavoritesPanel } from './features/favorites/FavoritesPanel';
import { TabsPanel } from './features/tabs/TabsPanel';
import { NotesPanel } from './features/notes/NotesPanel';
import { TabPreview } from './features/tabs/DraggableTab';
import { BookmarkPreview } from './features/favorites/BookmarkTile';
import { useTabs, type Tab } from './features/tabs/useTabs';
import {
  useBookmarks,
  type Bookmark,
  type BookmarksApi,
  type Group,
} from './features/favorites/useBookmarks';
import {
  resolveDropPosition,
  useAssignment,
  type DragSource,
  type DropTarget,
} from './features/favorites/useAssignment';
import { useBlockWidth, useBlockWidthMap } from './lib/widths';
import { getColor, useGroupColorMap } from './lib/groupColors';

const TAB_DRAG_PREFIX = 'tab:';

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

export default function App() {
  const [filter, setFilter] = useState('');
  const tabsApi = useTabs();
  const bookmarksApi = useBookmarks();
  const assignment = useAssignment(bookmarksApi);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tabsWidth, toggleTabsWidth] = useBlockWidth(
    'mosaic.tabsWidth',
    'full',
  );
  const [notesWidth, toggleNotesWidth] = useBlockWidth(
    'mosaic.notesWidth',
    'full',
  );
  const groupWidths = useBlockWidthMap('mosaic.groupWidths', 'half');
  const groupColors = useGroupColorMap('mosaic.groupColors');

  const filteredTabs = useMemo(() => {
    const matches = buildMatcher(filter);
    return tabsApi.tabs.filter((t) => matches(t.title, t.url));
  }, [tabsApi.tabs, filter]);

  const filteredFavoriteItems = useMemo(() => {
    const matches = buildMatcher(filter);
    return bookmarksApi.favoriteItems.filter((b) => matches(b.title, b.url));
  }, [bookmarksApi.favoriteItems, filter]);

  const groupDotById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    bookmarksApi.groups.forEach((g, i) => {
      map[g.id] = getColor(groupColors.getColorId(g.id, i)).dot;
    });
    return map;
  }, [bookmarksApi.groups, groupColors]);

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

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const source = active.data.current as DragSource | undefined;
    if (!source) return;
    const target = over.data.current as DropTarget | undefined;

    if (target?.type === 'placeholder') {
      void assignment.createGroupFromDrop(source);
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
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-5 pb-8 pt-3 md:px-8">
      <header className="flex flex-col gap-2.5 px-4 py-2.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <h1 className="font-display text-xl font-bold tracking-tight text-gradient-mosaic">
            Mosaïque
          </h1>
        </div>
        <div className="flex items-center gap-2.5 md:w-auto">
          <div className="flex-1 md:w-80">
            <SearchBar
              value={filter}
              onChange={setFilter}
              placeholder="Rechercher dans les favoris et onglets…"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <GoogleSearch />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="flex flex-col gap-8">
          {!bookmarksApi.loaded ? (
            <p className="text-base text-ink-500 dark:text-ink-300">Chargement…</p>
          ) : (
            <>
              <FavoritesPanel
                items={filteredFavoriteItems}
                groups={filteredGroups}
                allGroups={bookmarksApi.groups}
                groupDotById={groupDotById}
                favoritesRootId={bookmarksApi.favoritesRootId}
                groupWidths={groupWidths}
                groupColors={groupColors}
                autoEditId={assignment.autoEditId}
                onAutoEditDone={assignment.clearAutoEdit}
                onRenameBookmark={bookmarksApi.renameBookmark}
                onRemoveBookmark={bookmarksApi.removeBookmark}
                onAssignBookmark={assignment.assignBookmark}
                onRenameGroup={bookmarksApi.renameGroup}
                onRemoveGroup={bookmarksApi.removeGroup}
                onMoveGroup={bookmarksApi.moveGroup}
                onCreateEmptyGroup={assignment.createEmptyGroup}
                reorderEnabled={!filter.trim()}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  className={
                    tabsWidth === 'half' ? 'md:col-span-1' : 'md:col-span-2'
                  }
                >
                  <TabsPanel
                    tabs={filteredTabs}
                    loading={tabsApi.loading}
                    groups={bookmarksApi.groups}
                    groupDotById={groupDotById}
                    width={tabsWidth}
                    onToggleWidth={toggleTabsWidth}
                    onActivate={tabsApi.activate}
                    onClose={tabsApi.close}
                    onPinTab={assignment.pinTab}
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
