import { Screen, EmptyState } from '../../src/components';

export default function NotesScreen() {
  return (
    <Screen>
      <EmptyState
        title="No notes yet"
        description="Notes list screen is coming next."
        icon="note-text-outline"
      />
    </Screen>
  );
}
