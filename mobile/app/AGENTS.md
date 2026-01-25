# App Directory - Agent Guidelines

Expo Router file-based routing. Each file becomes a route.

## Routing Convention

| File | Route | Purpose |
|------|-------|---------|
| `index.tsx` | `/` | Home/Dashboard |
| `_layout.tsx` | - | Layout wrapper (providers, navigation config) |
| `(tabs)/_layout.tsx` | - | Tab navigator layout |
| `(tabs)/campaigns.tsx` | `/campaigns` | Campaigns list |
| `campaign/[id].tsx` | `/campaign/123` | Campaign detail |

## Layout Structure

```
_layout.tsx (Root)
├── ThemeProvider
├── StoreProvider
└── Stack Navigator
    ├── index.tsx (Home)
    ├── (tabs)/_layout.tsx (Tab Navigator)
    │   ├── campaigns.tsx
    │   ├── notes.tsx
    │   ├── npcs.tsx
    │   └── locations.tsx
    └── Dynamic routes
        ├── campaign/[id].tsx
        ├── note/[id].tsx
        └── ...
```

## Screen Template

```tsx
import { StyleSheet } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { Screen, Section, AppCard, EmptyState } from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing } from '../src/theme';
import { useEntities, useCreateEntity } from '../src/hooks';

export default function EntitiesScreen() {
  const { theme } = useTheme();
  const entities = useEntities();
  const createEntity = useCreateEntity();

  if (entities.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="No items yet"
          action={{ label: 'Create', onPress: () => {} }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Section title="All Items">
        {entities.map(item => (
          <AppCard
            key={item.id}
            title={item.name}
            onPress={() => router.push(`/entity/${item.id}`)}
          />
        ))}
      </Section>
    </Screen>
  );
}
```

## Navigation

```tsx
import { router, useLocalSearchParams } from 'expo-router';

// Navigate
router.push('/campaigns');
router.push(`/campaign/${id}`);
router.replace('/');
router.back();

// Get params
const { id } = useLocalSearchParams<{ id: string }>();
```

## Header Configuration

In screen file:
```tsx
import { Stack } from 'expo-router';

export default function CampaignDetail() {
  return (
    <>
      <Stack.Screen options={{ title: 'Campaign Name' }} />
      <Screen>...</Screen>
    </>
  );
}
```

Or in layout:
```tsx
<Stack.Screen name="campaign/[id]" options={{ title: 'Campaign' }} />
```

## Planned Routes

From MIGRATION_PLAN.md:
```
app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx        # Dashboard
│   ├── campaigns.tsx
│   ├── notes.tsx
│   ├── npcs.tsx
│   └── locations.tsx
├── campaign/[id].tsx
├── note/[id].tsx
├── npc/[id].tsx
├── location/[id].tsx
└── sync/
    ├── host.tsx         # DM hosts session
    └── join.tsx         # Players join
```

## Key Rules

1. **Always wrap with Screen** - Consistent padding, scroll, safe area
2. **Use router from expo-router** - Not react-navigation directly
3. **Dynamic params use [brackets]** - `[id].tsx` for `/entity/123`
4. **Groups use (parentheses)** - `(tabs)/` groups without affecting URL
5. **_layout.tsx** - For nested navigators and shared config
