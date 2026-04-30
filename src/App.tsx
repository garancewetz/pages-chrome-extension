import { useCallback, useMemo, useState } from 'react';
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
import { History } from 'lucide-react';
import { GoogleSearch } from './components/GoogleSearch';
import { Logo } from './components/ui/Logo';
import { SearchBar } from './components/ui/SearchBar';
import {
  ConfirmDialogProvider,
  useConfirm,
} from './components/ui/ConfirmDialog';
import { FavoritesPanel } from './features/favorites/FavoritesPanel';
import { TabsSidePanel } from './features/tabs/TabsSidePanel';
import { TabRowPreview } from './features/tabs/TabRow';
import { BookmarkPreview } from './features/favorites/BookmarkTile';
import { HistoryPanel } from './features/history/HistoryPanel';
import {
  useDeletionHistory,
  type DeletionEntry,
} from './features/history/useDeletionHistory';
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
import { useBlockWidthMap } from './lib/widths';
import { getColor, useGroupColorMap } from './lib/groupColors';
import { normalizeUrl } from './lib/url';

export type PinnedRef = { groupId: string | null };

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
  return (
    <ConfirmDialogProvider>
      <AppContent />
    </ConfirmDialogProvider>
  );
}

function AppContent() {
  const { confirm } = useConfirm();
  const [filter, setFilter] = useState('');
  const tabsApi = useTabs();
  const bookmarksApi = useBookmarks();
  const assignment = useAssignment(bookmarksApi);
  const history = useDeletionHistory();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const pinnedByUrl = useMemo<Map<string, PinnedRef>>(() => {
    const map = new Map<string, PinnedRef>();
    // Si la même URL est bookmarkée à la racine ET dans un groupe, on
    // privilégie la racine : on remplit donc les groupes en premier puis
    // les favoris racine, qui écrasent.
    bookmarksApi.groups.forEach((g) => {
      g.items.forEach((b) => {
        map.set(normalizeUrl(b.url), { groupId: g.id });
      });
    });
    bookmarksApi.favoriteItems.forEach((b) => {
      map.set(normalizeUrl(b.url), { groupId: null });
    });
    return map;
  }, [bookmarksApi.favoriteItems, bookmarksApi.groups]);

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

  const handleRemoveBookmark = useCallback(
    (id: string): void => {
      const bm = findBookmark(bookmarksApi, id);
      void bookmarksApi.removeBookmark(id);
      if (!bm) return;
      history.recordBookmark(id, {
        title: bm.title,
        url: bm.url,
        parentId: bm.parentId,
        index: bm.index,
      });
    },
    [bookmarksApi, history],
  );

  const handleRemoveGroup = useCallback(
    (id: string): void => {
      const grp = bookmarksApi.groups.find((g) => g.id === id);
      if (!grp) return;
      const itemsLabel =
        grp.items.length === 0
          ? ''
          : grp.items.length === 1
            ? ' et son 1 favori'
            : ` et ses ${grp.items.length} favoris`;
      void confirm({
        title: `Supprimer le groupe « ${grp.name} » ?`,
        description: `Le groupe${itemsLabel} sera supprimé. Vous pourrez le récupérer dans l'historique.`,
        confirmLabel: 'Oui, supprimer',
        cancelLabel: 'Non, garder',
        danger: true,
      }).then((ok) => {
        if (!ok) return;
        const snapshot = {
          name: grp.name,
          parentId: grp.parentId,
          index: grp.index,
          items: grp.items.map(({ title, url }) => ({ title, url })),
        };
        history.recordGroup(id, snapshot);
        void bookmarksApi.removeGroup(id);
      });
    },
    [bookmarksApi, confirm, history],
  );

  const handleRestoreFromHistory = useCallback(
    (entry: DeletionEntry): void => {
      if (entry.kind === 'bookmark') {
        void bookmarksApi.restoreBookmark(entry.snapshot);
      } else {
        void bookmarksApi.restoreGroup(entry.snapshot);
      }
      history.remove(entry.id);
    },
    [bookmarksApi, history],
  );

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
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-screen items-start">
        <TabsSidePanel
          tabs={filteredTabs}
          loading={tabsApi.loading}
          groups={bookmarksApi.groups}
          groupDotById={groupDotById}
          pinnedByUrl={pinnedByUrl}
          onActivate={tabsApi.activate}
          onClose={tabsApi.close}
          onPinTab={assignment.pinTab}
        />

        <div className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-8 pt-3 md:px-8">
            <header className="flex flex-col gap-2.5 px-4 py-2.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <h1 className="font-display text-xl font-bold tracking-tight text-violet-700 dark:text-violet-200">
              Mes Pages
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
            <button
              type="button"
              aria-label="Ouvrir l'historique des suppressions"
              onClick={() => setHistoryOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-ink-200 bg-white text-ink-500 transition-colors hover:border-violet-400 hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-violet-300 dark:hover:text-ink-50"
            >
              <History size={18} aria-hidden />
            </button>
          </div>
        </header>

        <GoogleSearch />

        <main className="flex flex-col gap-8">
          {!bookmarksApi.loaded ? (
            <p className="text-base text-ink-600 dark:text-ink-200">
              Chargement…
            </p>
          ) : (
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
              onRemoveBookmark={handleRemoveBookmark}
              onAssignBookmark={assignment.assignBookmark}
              onRenameGroup={bookmarksApi.renameGroup}
              onRemoveGroup={handleRemoveGroup}
              onMoveGroup={bookmarksApi.moveGroup}
              onCreateEmptyGroup={assignment.createEmptyGroup}
              reorderEnabled={!filter.trim()}
            />
          )}
        </main>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTab ? (
          <TabRowPreview tab={activeTab} />
        ) : activeBookmark ? (
          <BookmarkPreview bookmark={activeBookmark} />
        ) : null}
      </DragOverlay>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreFromHistory}
      />
    </DndContext>
  );
}
