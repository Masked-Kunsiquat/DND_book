# Theme Module - Agent Guidelines

Centralized theming system with React Native Paper (MD3) integration.

## Files

| File | Purpose |
|------|---------|
| `colors.ts` | Color palette (Tailwind-compatible) + tag colors |
| `spacing.ts` | Spacing scale, border radius, icon sizes |
| `typography.ts` | Font families, sizes, weights, text styles |
| `index.ts` | Paper theme config, exports everything |
| `ThemeProvider.tsx` | React context provider, hooks |

## Usage

### In Components

```typescript
import { useTheme, useThemeColors } from '../theme/ThemeProvider';
import { spacing, layout, semanticColors } from '../theme';

function MyComponent() {
  const { theme, isDark } = useTheme();
  // or just colors:
  const colors = useThemeColors();

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: spacing[4],
      borderRadius: layout.cardBorderRadius,
    }}>
      <Text style={{ color: theme.colors.onSurface }}>
        Hello
      </Text>
    </View>
  );
}
```

### Tag Colors

```typescript
import { getTagColor } from '../theme';

const { bg, text, name } = getTagColor(tagId);
// bg: '#dbeafe', text: '#1e40af', name: 'blue'
```

## Color Naming

Paper uses MD3 color scheme:
- `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`
- `secondary`, `onSecondary`, `secondaryContainer`, `onSecondaryContainer`
- `surface`, `onSurface`, `surfaceVariant`, `onSurfaceVariant`
- `background`, `onBackground`
- `error`, `onError`, `errorContainer`, `onErrorContainer`
- `outline`, `outlineVariant`

For semantic colors (success, warning, info), use:
```typescript
import { semanticColors } from '../theme';

semanticColors.success.main  // #10b981
semanticColors.warning.light // #fef3c7
```

## Spacing Scale

Based on 4px unit (Tailwind convention):
```typescript
spacing[1]  // 4px
spacing[2]  // 8px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
```

## Layout Constants

```typescript
layout.screenPadding    // 16px
layout.cardPadding      // 16px
layout.cardBorderRadius // 12px
layout.listItemHeight   // 56px
layout.headerHeight     // 56px
layout.tabBarHeight     // 64px
layout.fabSize          // 56px
```

## Dark Mode

Dark is default. To toggle:
```typescript
const { toggleTheme, setThemeMode, isDark } = useTheme();

toggleTheme();           // Toggle light/dark
setThemeMode('system');  // Follow device setting
setThemeMode('light');   // Force light
setThemeMode('dark');    // Force dark
```

## Key Rules

1. **Never hardcode colors** - Always use `theme.colors.*` or palette imports
2. **Never hardcode spacing** - Use `spacing.*` or `layout.*`
3. **Use Paper components** - `Text`, `Button`, `Card`, etc. auto-theme
4. **Check `isDark`** for conditional styling when needed
