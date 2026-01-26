import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton, Menu } from 'react-native-paper';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';

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

function HeaderMenu() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const openMenu = () => {
    setTimeout(() => setVisible(true), 0);
  };
  const toggleMenu = () => {
    if (visible) {
      setVisible(false);
      return;
    }
    openMenu();
  };
  const closeMenu = () => setVisible(false);

  const goToSettings = () => {
    closeMenu();
    router.push('/settings');
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchorPosition="bottom"
      anchor={
        <IconButton
          icon="dots-vertical"
          onPress={toggleMenu}
          iconColor={theme.colors.onSurface}
          accessibilityLabel="Open menu"
          style={{ marginRight: spacing[1] }}
        />
      }
      contentStyle={{ backgroundColor: theme.colors.surface }}
    >
      <Menu.Item onPress={goToSettings} title="Settings" />
    </Menu>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerRight: () => <HeaderMenu />,
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
