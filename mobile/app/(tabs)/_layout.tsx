import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type TabIconConfig = {
  label: string;
  active: IconName;
  inactive: IconName;
};

const TAB_ICONS: Record<string, TabIconConfig> = {
  index: {
    label: 'Dashboard',
    active: 'view-dashboard',
    inactive: 'view-dashboard-outline',
  },
  campaigns: {
    label: 'Campaigns',
    active: 'folder',
    inactive: 'folder-outline',
  },
  notes: {
    label: 'Notes',
    active: 'note-text',
    inactive: 'note-text-outline',
  },
  npcs: {
    label: 'NPCs',
    active: 'account-group',
    inactive: 'account-group-outline',
  },
  locations: {
    label: 'Locations',
    active: 'map-marker',
    inactive: 'map-marker-outline',
  },
};

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      {Object.entries(TAB_ICONS).map(([name, config]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: config.label,
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? config.active : config.inactive}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
