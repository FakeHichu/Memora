import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
  borders,
  webShadows,
  shadows,
} from '@/constants/theme';

type CircleCardProps = {
  name: string;
  school?: string;
  year?: string;
  memberCount?: number;
  photoCount?: number;
  avatar?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function CircleCard({
  name,
  school,
  year,
  memberCount,
  photoCount,
  avatar,
  onPress,
  style,
}: CircleCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={styles.avatarWrapper}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.badgeWrapper}>
          <View style={styles.classBadge} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {school && <Text style={styles.school}>{school}</Text>}
        {year && <Text style={styles.year}>{year}</Text>}
      </View>

      {(memberCount !== undefined || photoCount !== undefined) && (
        <View style={styles.stats}>
          {memberCount !== undefined && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{memberCount}</Text>
              <Text style={styles.statLabel}>{memberCount === 1 ? 'Member' : 'Members'}</Text>
            </View>
          )}
          {photoCount !== undefined && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{photoCount}</Text>
              <Text style={styles.statLabel}>{photoCount === 1 ? 'Memory' : 'Memories'}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
    ...(Platform.OS === 'web' ? webShadows.xs : shadows.xs),
  },
  pressed: {
    opacity: 0.85,
  },
  avatarWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
  },
  avatarPlaceholder: {
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.title2,
    color: colors.accent,
    fontWeight: '700',
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  classBadge: {
    width: 18,
    height: 18,
    borderRadius: radius.circle,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  school: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: 1,
  },
  year: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingLeft: spacing.sm,
    borderLeftWidth: borders.hairline,
    borderLeftColor: colors.borderSoft,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.title3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption2,
    color: colors.textMuted,
    marginTop: 1,
  },
});
