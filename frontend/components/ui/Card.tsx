import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(216, 201, 191, 0.28)' },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
});
