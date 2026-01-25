import { Screen, EmptyState } from '../../src/components';

export default function LocationsScreen() {
  return (
    <Screen>
      <EmptyState
        title="No locations yet"
        description="Locations list screen is coming next."
        icon="map-marker-outline"
      />
    </Screen>
  );
}
