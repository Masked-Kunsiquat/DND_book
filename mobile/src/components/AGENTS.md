# Components Module - Agent Guidelines

Reusable UI components built on React Native Paper with custom theming.

## Directory Structure

```
components/
├── cards/          # Card-based content display
│   └── AppCard.tsx
├── chips/          # Tag/badge components
│   └── TagChip.tsx
├── layout/         # Screen structure components
│   ├── Screen.tsx
│   └── Section.tsx
├── shared/         # Common utilities
│   ├── EmptyState.tsx
│   └── LoadingScreen.tsx
└── index.ts        # Barrel exports
```

## Available Components

### Layout

**Screen** - Wrap all screens with this:
```tsx
<Screen scroll={true} safe={true} onRefresh={handleRefresh}>
  {content}
</Screen>
```

**Section** - Group related content:
```tsx
<Section title="Recent Notes" icon="note-text" action={{ label: 'See All', onPress }}>
  {cards}
</Section>
```

### Content

**AppCard** - Display entity cards:
```tsx
<AppCard
  title="Dragon's Lair"
  subtitle="A dangerous cave in the mountains"
  onPress={handlePress}
  right={<IconButton icon="chevron-right" />}
>
  <TagChip id={tag.id} name={tag.name} />
</AppCard>
```

**TagChip** - Color-coded tags:
```tsx
<TagChip id={tag.id} name={tag.name} onPress={handlePress} onClose={handleRemove} />
```

### Feedback

**EmptyState** - When lists are empty:
```tsx
<EmptyState
  title="No campaigns yet"
  description="Create your first campaign to get started"
  icon="folder-plus"
  action={{ label: 'Create Campaign', onPress }}
/>
```

**LoadingScreen** - Full-screen loader:
```tsx
<LoadingScreen message="Loading campaigns..." />
```

## Component Guidelines

### Always Use Theme
```tsx
import { useTheme } from '../../theme/ThemeProvider';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.onSurface }}>...</Text>
    </View>
  );
}
```

### Use Spacing Constants
```tsx
import { spacing, layout } from '../../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    gap: spacing[3],
    borderRadius: layout.cardBorderRadius,
  },
});
```

### Icons
Use MaterialCommunityIcons from @expo/vector-icons:
```tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { iconSizes } from '../../theme';

<MaterialCommunityIcons name="folder" size={iconSizes.md} color={theme.colors.primary} />
```

Browse icons: https://icons.expo.fyi (filter by MaterialCommunityIcons)

### Props Pattern
```tsx
export interface MyComponentProps {
  // Required props first
  title: string;
  onPress: () => void;
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
}

export function MyComponent({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: MyComponentProps) {
  // ...
}
```

## Adding New Components

1. Create file in appropriate subdirectory
2. Use `useTheme()` for all colors
3. Use `spacing.*` for all sizing
4. Export props interface
5. Add to `index.ts` barrel export
6. Document props with JSDoc comments

## Planned Components

Future additions from MIGRATION_PLAN.md Phase 4:
- `forms/` - TextInput, Select, DatePicker wrappers
- `sync/` - SyncStatus, RoomCodeDisplay, PeerList
- `cards/` - CampaignCard, NoteCard, NpcCard, LocationCard
