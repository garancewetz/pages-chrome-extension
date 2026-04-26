import { useState } from 'react';
import { Grid } from './components/ui/Grid';
import { SearchBar } from './components/ui/SearchBar';
import { TabsPanel } from './features/tabs/TabsPanel';
import { BookmarksPanel } from './features/bookmarks/BookmarksPanel';
import { NotesPanel } from './features/notes/NotesPanel';

export default function App() {
  const [filter, setFilter] = useState('');

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-ink">Mosaic Dashboard</h1>
        <div className="md:w-80">
          <SearchBar
            value={filter}
            onChange={setFilter}
            placeholder="Filtrer par titre ou URL…"
          />
        </div>
      </header>

      <main className="flex-1">
        <Grid>
          <TabsPanel filter={filter} />
          <BookmarksPanel filter={filter} />
          <NotesPanel />
        </Grid>
      </main>
    </div>
  );
}
