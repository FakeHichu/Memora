import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';

import { colors, radius, spacing, typography, borders, webShadows, shadows } from '@/constants/theme';
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
    <View style={[styles.sectionWrapper, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {action && (
          <Pressable onPress={action.onPress} style={styles.action} accessibilityRole="button">
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.card}>{children}</View>
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
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon as any} size={18} color={destructive ? colors.error : colors.accent} />
          </View>
        )}
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, destructive && styles.rowValueDestructive]}>{value}</Text>
        ) : null}
        {onPress && <Icon name="chevron-right" size={16} color={colors.textTertiary} />}
      </View>
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
  sectionWrapper: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.sans.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  action: {
    paddingHorizontal: spacing.xs,
  },
  actionLabel: {
    ...typography.sans.subheadline,
    color: colors.accent,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? webShadows.xs : shadows.xs),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 46,
  },
  rowInteractive: {
    backgroundColor: 'transparent',
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowDestructive: {},
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.sans.body,
    color: colors.textPrimary,
    fontWeight: '400',
    fontSize: 16,
  },
  rowLabelDestructive: {
    color: colors.error,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    ...typography.sans.body,
    color: colors.textSecondary,
    fontSize: 15,
  },
  rowValueDestructive: {
    color: colors.error,
  },
  divider: {
    height: borders.hairline,
    backgroundColor: colors.border,
    marginLeft: 36,
  },
});
