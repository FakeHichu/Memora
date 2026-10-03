import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export function Card({ children, style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: { boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.28)' },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 22,
        elevation: 8,
      },
    }),
  },
  });
}
