import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';

type TagBadgeProps = {
  label: string;
  onPress?: () => void;
  onRemove?: () => void;
  active?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

export function TagBadge({
  label,
  onPress,
  onRemove,
  active = false,
  size = 'sm',
  style,
}: TagBadgeProps) {
  const content = (
    <View
      style={[
        styles.badge,
        size === 'md' ? styles.badgeMd : styles.badgeSm,
        active ? styles.badgeActive : styles.badgeDefault,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'md' ? styles.labelMd : styles.labelSm,
          active ? styles.labelActive : styles.labelDefault,
        ]}
        numberOfLines={1}
      >
        #{label}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${label}`}
        >
          <Text style={styles.removeIcon}>×</Text>
        </Pressable>
      )}
    </View>
  );

  if (onPress && !onRemove) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Filter by tag ${label}`}
        accessibilityState={{ selected: active }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

type TagListProps = {
  tags: string[];
  onRemove?: (tag: string) => void;
  onPress?: (tag: string) => void;
  activeTag?: string;
  size?: 'sm' | 'md';
  maxVisible?: number;
  style?: ViewStyle;
};

export function TagList({
  tags,
  onRemove,
  onPress,
  activeTag,
  size = 'sm',
  maxVisible,
  style,
}: TagListProps) {
  const visible = maxVisible ? tags.slice(0, maxVisible) : tags;
  const remaining = maxVisible ? tags.length - maxVisible : 0;

  if (tags.length === 0) return null;

  return (
    <View style={[styles.tagList, style]}>
      {visible.map((tag) => (
        <TagBadge
          key={tag}
          label={tag}
          onPress={onPress ? () => onPress(tag) : undefined}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
          active={activeTag === tag}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <View style={[styles.badge, styles.badgeSm, styles.badgeDefault]}>
          <Text style={[styles.label, styles.labelSm, styles.labelDefault]}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.round,
    borderWidth: borders.hairline,
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 3,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  badgeDefault: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSubtle,
  },
  badgeActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSm: {
    ...typography.sans.caption2,
    fontSize: 11,
  },
  labelMd: {
    ...typography.sans.caption,
    fontWeight: '600',
  },
  labelDefault: {
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  removeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 14,
    lineHeight: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
