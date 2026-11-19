import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '../ui/Icons';
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import type { UnifiedCircle } from '@/contexts/CircleContext';

interface CircleHomeSectionProps {
  circle: UnifiedCircle;
  onShareMemory?: () => void;
}

/** Renders up to 4 avatar initials + overflow count, matching the screenshots */
function MemberAvatarRow({ count }: { count: number }) {
  const { colors } = useAppTheme();
  const max = 4;
  const avatarColors = ['#B4BEFE', '#CBA6F7', '#89B4FA', '#94E2D5', '#A6E3A1'];
  const shown = Math.min(count, max);
  const overflow = count - shown;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: shown }).map((_, i) => (
        <View
          key={i}
          style={[
            avatarStyle.avatar,
            {
              backgroundColor: avatarColors[i % avatarColors.length],
              marginLeft: i === 0 ? 0 : -8,
              borderColor: colors.card,
              zIndex: shown - i,
            },
          ]}
        >
          <Text style={[avatarStyle.text, { color: colors.crust }]}>
            {String.fromCharCode(65 + i)}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            avatarStyle.avatar,
            avatarStyle.overflow,
            { backgroundColor: colors.surface1, marginLeft: -8, borderColor: colors.card },
          ]}
        >
          <Text style={[avatarStyle.text, { color: colors.textSecondary }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

const avatarStyle = StyleSheet.create({
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflow: {},
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export function CircleHomeSection({ circle, onShareMemory }: CircleHomeSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Section Label */}
      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>YOUR CIRCLE</Text>
        <Pressable
          style={styles.activePill}
          onPress={() => router.push('/(tabs)/circle')}
          accessibilityRole="button"
        >
          <View style={styles.activeDot} />
          <Text style={styles.activePillText}>Active</Text>
          <Icon name="chevron-right" size={12} color={colors.success} />
        </Pressable>
      </View>

      {/* Circle Card – matches screenshots */}
      <Pressable
        style={styles.circleCard}
        onPress={() => router.push('/(tabs)/circle')}
        accessibilityRole="button"
        accessibilityLabel={`Open ${circle.name} circle`}
      >
        {/* Circle name */}
        <Text style={styles.circleName} numberOfLines={1}>
          {circle.name}
        </Text>

        {/* Member avatars + count */}
        <View style={styles.membersRow}>
          <MemberAvatarRow count={circle.memberCount} />
          {circle.memberCount > 4 && (
            <Text style={styles.memberCountText}>
              +{circle.memberCount - 4}
            </Text>
          )}
        </View>

        {/* "You're inside this Circle!" badge */}
        <View style={styles.insideBadge}>
          <Icon name="users" size={13} color={colors.success} />
          <Text style={styles.insideBadgeText}>You're inside this Circle!</Text>
        </View>

        {/* View Circle link */}
        <Pressable
          style={styles.viewCircleBtn}
          onPress={() => router.push('/(tabs)/circle')}
          accessibilityRole="button"
          accessibilityLabel="View Circle"
        >
          <Text style={styles.viewCircleBtnText}>View Circle →</Text>
        </Pressable>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    sectionLabel: {
      ...typography.mono.micro,
      color: colors.textMuted,
      letterSpacing: 1.0,
      fontSize: 10,
    },
    activePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(166, 227, 161, 0.15)',
      borderWidth: borders.thin,
      borderColor: colors.success,
      borderRadius: radius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    activePillText: {
      ...typography.sans.caption2,
      color: colors.success,
      fontWeight: '700',
      fontSize: 11,
    },
    circleCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      padding: spacing.lg,
      gap: spacing.sm,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 3,
          }),
    },
    circleName: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    membersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    memberCountText: {
      ...typography.sans.caption,
      color: colors.textMuted,
      fontWeight: '600',
    },
    insideBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    insideBadgeText: {
      ...typography.sans.footnote,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    viewCircleBtn: {
      marginTop: spacing.xs,
    },
    viewCircleBtnText: {
      ...typography.sans.footnote,
      color: colors.accent,
      fontWeight: '700',
    },
  });
}
