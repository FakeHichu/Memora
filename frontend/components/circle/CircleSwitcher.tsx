import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '../ui/Icons';
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import type { UnifiedCircle } from '@/contexts/CircleContext';

interface CircleSwitcherProps {
  circles: UnifiedCircle[];
  activeCircleId: string | null;
  onSelectCircle: (circleId: string) => Promise<void>;
  onJoinCircle?: () => void;
}

export function CircleSwitcher({
  circles,
  activeCircleId,
  onSelectCircle,
  onJoinCircle,
}: CircleSwitcherProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (circles.length <= 1) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Your Circles</Text>

      {/* Circle List */}
      <View style={styles.listContainer}>
        {circles.map((circle) => {
          const isActive = circle.id === activeCircleId;
          return (
            <Pressable
              key={circle.id}
              onPress={() => !isActive && onSelectCircle(circle.id)}
              style={[styles.circleItem, isActive && styles.circleItemActive]}
              accessibilityRole="button"
              accessibilityLabel={`${isActive ? 'Active circle' : 'Switch to'} ${circle.name}`}
              disabled={isActive}
            >
              {/* Icon */}
              <View style={[styles.circleIconSmall, isActive && styles.circleIconSmallActive]}>
                <Text style={[styles.circleIconText, isActive && styles.circleIconTextActive]}>
                  {circle.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.circleItemInfo}>
                <Text style={[styles.circleItemName, isActive && styles.circleItemNameActive]}>
                  {circle.name}
                </Text>
                <Text style={styles.circleItemMeta}>
                  {circle.memberCount} member{circle.memberCount === 1 ? '' : 's'}
                </Text>
              </View>

              {/* Status Badge */}
              <View style={styles.circleItemRight}>
                {isActive ? (
                  <View style={styles.activeBadge}>
                    <View style={styles.activeDotSmall} />
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                ) : (
                  <Text style={styles.switchText}>Switch</Text>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Join Another Circle */}
        {onJoinCircle && (
          <Pressable
            onPress={onJoinCircle}
            style={styles.joinButton}
            accessibilityRole="button"
            accessibilityLabel="Join another circle"
          >
            <Icon name="plus" size={16} color={colors.accent} />
            <Text style={styles.joinButtonText}>Join another Circle</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    header: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    listContainer: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    circleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }),
    },
    circleItemActive: {
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
      borderWidth: 1.5,
    },
    circleIconSmall: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleIconSmallActive: {
      backgroundColor: colors.accent,
    },
    circleIconText: {
      ...typography.sans.bodyStrong,
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
    },
    circleIconTextActive: {
      color: '#FFFFFF',
    },
    circleItemInfo: {
      flex: 1,
    },
    circleItemName: {
      ...typography.sans.bodyStrong,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    circleItemNameActive: {
      color: colors.accent,
      fontWeight: '700',
    },
    circleItemMeta: {
      ...typography.sans.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    circleItemRight: {
      marginLeft: spacing.xs,
    },
    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.successSoft,
      borderRadius: radius.sm,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    activeDotSmall: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    activeBadgeText: {
      ...typography.mono.micro,
      color: colors.success,
      fontWeight: '700',
      fontSize: 10,
    },
    switchText: {
      ...typography.sans.caption,
      color: colors.accent,
      fontWeight: '600',
    },
    joinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderStyle: 'dashed',
    },
    joinButtonText: {
      ...typography.sans.bodyStrong,
      color: colors.accent,
      fontWeight: '700',
    },
  });
}
