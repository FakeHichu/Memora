import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, ScrollView, Platform } from 'react-native';

import { colors, radius, spacing, typography, borders, webShadows, shadows } from '@/constants/theme';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function FilterChip({ label, selected, onPress, style }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && !selected && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

type FilterChipsProps = {
  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  style?: ViewStyle;
  scrollable?: boolean;
};

export function FilterChips({
  filters,
  selectedFilter,
  onFilterChange,
  style,
  scrollable = true,
}: FilterChipsProps) {
  const content = (
    <View style={styles.container}>
      {filters.map((filter) => (
        <FilterChip
          key={filter}
          label={filter}
          selected={selectedFilter === filter}
          onPress={() => onFilterChange(filter)}
        />
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? webShadows.xs : shadows.xs),
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.sans.footnote,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
