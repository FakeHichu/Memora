import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, ScrollView } from 'react-native';

import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function FilterChip({ label, selected, onPress, style }: FilterChipProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
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
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      backgroundColor: colors.card,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      minHeight: 36,
      justifyContent: 'center',
    },
    selected: {
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
      borderWidth: borders.thin,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.sans.caption,
      color: colors.textSecondary,
    },
    labelSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
  });
}
