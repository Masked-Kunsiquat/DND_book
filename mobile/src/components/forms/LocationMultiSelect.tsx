/**
 * Location picker with search + type filters.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, List, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';
import type { Location, LocationType } from '../../types/schema';

type LocationCategory = 'all' | LocationType;

const LOCATION_TYPE_ORDER: LocationType[] = [
  'Plane',
  'Realm',
  'Continent',
  'Territory',
  'Province',
  'Locale',
  'Landmark',
];

const LOCATION_TYPE_LABELS: Record<LocationType, { singular: string; plural: string }> = {
  Plane: { singular: 'Plane', plural: 'Planes' },
  Realm: { singular: 'Realm', plural: 'Realms' },
  Continent: { singular: 'Continent', plural: 'Continents' },
  Territory: { singular: 'Territory', plural: 'Territories' },
  Province: { singular: 'Province', plural: 'Provinces' },
  Locale: { singular: 'Locale', plural: 'Locales' },
  Landmark: { singular: 'Landmark', plural: 'Landmarks' },
};

export interface LocationMultiSelectProps {
  locations: Location[];
  value: string[];
  onChange: (value: string[]) => void;
  helperText?: string;
  disabled?: boolean;
}

export function LocationMultiSelect({
  locations,
  value,
  onChange,
  helperText,
  disabled = false,
}: LocationMultiSelectProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<LocationCategory | null>(null);
  const [autoSelected, setAutoSelected] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (normalizedQuery && activeType === null) {
      setActiveType('all');
      setAutoSelected(true);
    }
    if (!normalizedQuery && autoSelected) {
      setActiveType(null);
      setAutoSelected(false);
    }
  }, [activeType, autoSelected, normalizedQuery]);

  const typeOptions = useMemo(() => {
    const counts = new Map<LocationType, number>();
    locations.forEach((location) => {
      const current = counts.get(location.type) ?? 0;
      counts.set(location.type, current + 1);
    });

    const options: { value: LocationCategory; label: string; count: number }[] = [
      { value: 'all', label: 'All Locations', count: locations.length },
    ];

    LOCATION_TYPE_ORDER.forEach((type) => {
      const count = counts.get(type) ?? 0;
      if (count > 0) {
        const labels = LOCATION_TYPE_LABELS[type];
        const displayLabel = count === 1 ? labels.singular : labels.plural;
        options.push({ value: type, label: displayLabel, count });
      }
    });

    return options;
  }, [locations]);

  const filteredLocations = useMemo(() => {
    let list = locations;
    if (activeType && activeType !== 'all') {
      list = list.filter((location) => location.type === activeType);
    }
    if (normalizedQuery) {
      list = list.filter((location) => {
        const name = location.name?.toLowerCase() ?? '';
        const type = location.type?.toLowerCase() ?? '';
        return name.includes(normalizedQuery) || type.includes(normalizedQuery);
      });
    }
    return [...list].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    );
  }, [activeType, locations, normalizedQuery]);

  const selectedCountLabel = `${value.length} selected`;

  const handleSelectCategory = (category: LocationCategory) => {
    setActiveType(category);
    setAutoSelected(false);
  };

  const handleBack = () => {
    setActiveType(null);
    setAutoSelected(false);
    setQuery('');
  };

  const showCategories = activeType === null;
  const showBack = activeType !== null;
  const activeLabel = activeType
    ? activeType === 'all'
      ? 'All Locations'
      : LOCATION_TYPE_LABELS[activeType].plural
    : 'Locations';

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Search locations"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or type"
        disabled={disabled}
        right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
      />
      {showCategories ? (
        <ScrollView
          style={styles.categoryList}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          {typeOptions.map((option) => (
            <Button
              key={option.value}
              mode="outlined"
              onPress={() => handleSelectCategory(option.value)}
              disabled={disabled}
              style={[
                styles.categoryItem,
                {
                  borderColor: theme.colors.outlineVariant,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
              contentStyle={styles.categoryContentRow}
              labelStyle={{ color: theme.colors.onSurface }}
            >
              <View style={styles.categoryRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {option.label}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {option.count}
                </Text>
              </View>
            </Button>
          ))}
        </ScrollView>
      ) : (
        <>
          <View style={styles.headerRow}>
            {showBack && (
              <Button mode="text" onPress={handleBack} disabled={disabled} compact>
                Back
              </Button>
            )}
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
              {activeLabel}
            </Text>
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedCountLabel}
          </Text>
          {filteredLocations.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No matching locations.
            </Text>
          ) : (
            <ScrollView
              style={styles.options}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredLocations.map((location) => {
                const selected = value.includes(location.id);
                const description =
                  location.scope === 'continuity' ? `${location.type} (Shared)` : location.type;
                return (
                  <List.Item
                    key={location.id}
                    title={location.name || 'Unnamed location'}
                    description={description}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={() => (
                      <Checkbox
                        status={selected ? 'checked' : 'unchecked'}
                        onPress={() => toggleValue(location.id)}
                      />
                    )}
                    onPress={() => toggleValue(location.id)}
                  />
                );
              })}
            </ScrollView>
          )}
        </>
      )}
      {helperText ? (
        <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  categoryList: {
    maxHeight: 320,
  },
  categoryContent: {
    gap: spacing[2],
  },
  categoryItem: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  categoryContentRow: {
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  options: {
    maxHeight: 320,
  },
  optionsContent: {
    gap: spacing[1],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
