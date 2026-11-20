import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/providers/ThemeProvider';
import { radius, spacing, typography } from '@/constants/theme';

type ColorOption = {
  name: string;
  color: string;
  lightColor?: string;
};

const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Lavender', color: '#B4BEFE', lightColor: '#7287FD' },
  { name: 'Blue', color: '#89B4FA', lightColor: '#1E66F5' },
  { name: 'Teal', color: '#94E2D5', lightColor: '#179299' },
  { name: 'Green', color: '#A6E3A1', lightColor: '#40A02B' },
  { name: 'Yellow', color: '#F9E2AF', lightColor: '#DF8E1D' },
  { name: 'Peach', color: '#FAB387', lightColor: '#FE640B' },
  { name: 'Pink', color: '#F5C2E7', lightColor: '#EA76CB' },
  { name: 'Rosewater', color: '#F5E0DC', lightColor: '#DC8A78' },
  { name: 'Red', color: '#F38BA8', lightColor: '#D20F39' },
  { name: 'Mauve', color: '#CBA6F7', lightColor: '#8839EF' },
];

export function ColorPaletteSwitcher() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const [selectedColor, setSelectedColor] = React.useState('Lavender');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {COLOR_OPTIONS.map((option) => {
        const isSelected = selectedColor === option.name;
        const displayColor = mode === 'dark' ? option.color : (option.lightColor || option.color);
        
        return (
          <Pressable
            key={option.name}
            onPress={() => setSelectedColor(option.name)}
            style={[
              styles.colorOption,
              isSelected && styles.colorOptionSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${option.name} theme`}
            accessibilityState={{ selected: isSelected }}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: displayColor },
                isSelected && styles.colorCircleSelected,
              ]}
            />
            <Text style={[styles.colorLabel, isSelected && styles.colorLabelSelected]}>
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    scrollView: {
      flexGrow: 0,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    colorOption: {
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
    },
    colorOptionSelected: {
      backgroundColor: colors.surfaceOverlay,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: radius.circle,
      borderWidth: 2,
      borderColor: 'transparent',
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }),
    },
    colorCircleSelected: {
      borderColor: colors.textPrimary,
      borderWidth: 2.5,
      transform: [{ scale: 1.1 }],
    },
    colorLabel: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '500',
    },
    colorLabelSelected: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
}
