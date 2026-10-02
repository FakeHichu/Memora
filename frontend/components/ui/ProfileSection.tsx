import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';

type ProfileSectionProps = {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function ProfileSection({ title, children, style, action }: ProfileSectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {action && (
          <Pressable onPress={action.onPress} style={styles.action} accessibilityRole="button">
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
  icon?: string;
  style?: ViewStyle;
  destructive?: boolean;
};

export function ProfileRow({
  label,
  value,
  onPress,
  icon,
  style,
  destructive = false,
}: ProfileRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        onPress && styles.rowInteractive,
        pressed && onPress && styles.rowPressed,
        destructive && styles.rowDestructive,
        style,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={styles.rowLeft}>
        {icon && <Icon name={icon as any} size={20} color={colors.textSecondary} />}
        <View style={styles.textContainer}>
          <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
          <Text style={[styles.rowValue, destructive && styles.rowValueDestructive]}>{value}</Text>
        </View>
      </View>
      {onPress && <Icon name="chevron-right" size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

type ProfileDividerProps = {
  style?: ViewStyle;
};

export function ProfileDivider({ style }: ProfileDividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  action: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  rowInteractive: {
    backgroundColor: 'transparent',
  },
  rowPressed: {
    backgroundColor: colors.backgroundElevated,
  },
  rowDestructive: {},
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowLabelDestructive: {
    color: colors.error,
  },
  rowValue: {
    ...typography.sans.body,
    color: colors.textPrimary,
    marginTop: 1,
  },
  rowValueDestructive: {
    color: colors.error,
  },
  divider: {
    height: borders.hairline,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.sm,
  },
});