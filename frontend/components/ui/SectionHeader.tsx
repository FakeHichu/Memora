import React from 'react';
import { StyleSheet, Text, View, ViewStyle, Pressable } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
};

export function SectionHeader({ title, subtitle, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <Pressable onPress={action.onPress} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.callout,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
