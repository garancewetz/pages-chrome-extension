import { Card } from '../../components/ui/Card';
import { useNotes } from './useNotes';

export function NotesPanel() {
  const { note, save, loaded } = useNotes();

  return (
    <Card
      title="Note rapide"
      action={
        <span className="text-xs text-muted">
          {loaded ? 'sync. local' : '…'}
        </span>
      }
    >
      <textarea
        value={note}
        onChange={(e) => save(e.target.value)}
        placeholder="Écrivez ici… (sauvegarde automatique)"
        className="h-full min-h-[180px] w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-accent-border focus:outline-none focus:ring-2 focus:ring-accent-border"
      />
    </Card>
  );
}
