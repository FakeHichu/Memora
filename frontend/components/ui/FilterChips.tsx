import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle, ScrollView } from 'react-native';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
};
export function FilterChip({ label, selected, onPress, style }: FilterChipProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.unselectedLabel]}>
        {label}
      </Text>
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
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
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
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  const activeBg = isDark ? '#8052C8' : '#261D32';
  const activeText = '#FFFFFF';
  const inactiveBg = colors.card;
  const inactiveText = colors.textSecondary;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 10,
    },
    scrollView: {
      paddingHorizontal: spacing.lg,
    },
    scrollContent: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 6,
    },
    chip: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedChip: {
      backgroundColor: activeBg,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 4px 14px rgba(128, 82, 200, 0.4)'
              : '0 4px 14px rgba(38, 29, 50, 0.25)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }),
    },
    unselectedChip: {
      backgroundColor: inactiveBg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: -0.2,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    },
    selectedLabel: {
      color: activeText,
    },
    unselectedLabel: {
      color: inactiveText,
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.96 }],
    },
  });
}