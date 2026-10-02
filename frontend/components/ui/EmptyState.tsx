import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography, radius, borders } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';

type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
};

export function EmptyState({
  title,
  message,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <Icon name={icon as any} size={48} color={colors.textMuted} opacity={0.25} />}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && (
        <Pressable onPress={action.onPress} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.sans.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(122, 159, 216, 0.15)',
    borderRadius: radius.round,
  },
  actionLabel: {
    ...typography.sans.callout,
    color: colors.accent,
    fontWeight: '600',
  },
});