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
    ...typography.sans.title2,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.sans.subheadline,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  actionLabel: {
    ...typography.sans.subheadline,
    color: colors.accent,
    fontWeight: '500',
  },
});