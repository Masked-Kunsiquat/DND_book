import { Screen, EmptyState } from '../../src/components';

export default function CampaignsScreen() {
  return (
    <Screen>
      <EmptyState
        title="No campaigns yet"
        description="Campaign management is coming next."
        icon="folder-open-outline"
      />
    </Screen>
  );
}
