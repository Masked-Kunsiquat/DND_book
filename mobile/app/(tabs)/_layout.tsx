import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Tabs, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton, List, Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
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
  sessions: {
    label: 'Sessions',
    active: 'calendar',
    inactive: 'calendar-outline',
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
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

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

  const goToContinuity = () => {
    closeMenu();
    router.push('/continuities');
  };

  return (
    <>
      <IconButton
        icon="dots-vertical"
        onPress={toggleMenu}
        iconColor={theme.colors.onSurface}
        accessibilityLabel="Open menu"
        style={{ marginRight: spacing[1] }}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeMenu}
          contentContainerStyle={[
            styles.menuSurface,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
              top: Math.max(insets.top, headerHeight - spacing[1]),
              right: spacing[2],
            },
          ]}
        >
          <List.Item
            title="Settings"
            left={(props) => <List.Icon {...props} icon="cog-outline" />}
            onPress={goToSettings}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <List.Item
            title="Continuity"
            left={(props) => <List.Icon {...props} icon="infinity" />}
            onPress={goToContinuity}
            titleStyle={{ color: theme.colors.onSurface }}
          />
        </Modal>
      </Portal>
    </>
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
      <Tabs.Screen name="campaigns" options={{ href: null, title: 'Campaigns' }} />
    </Tabs>
  );
}

const styles = {
  menuSurface: {
    position: 'absolute',
    minWidth: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
} as const;
