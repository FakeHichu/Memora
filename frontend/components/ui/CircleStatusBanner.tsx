import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Icon } from './Icons';
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import type { Circle } from '@/hooks/useCircle';

interface CircleStatusBannerProps {
  circle: Circle | null;
  onPress?: () => void;
  compact?: boolean;
}

export function CircleStatusBanner({ circle, onPress, compact = false }: CircleStatusBannerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (!circle) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.banner, compact && styles.bannerCompact]}
      accessibilityRole="button"
      accessibilityLabel={`Active circle: ${circle.name}. Tap to view details.`}
    >
      {/* Active Indicator */}
      <View style={styles.leftSection}>
        <View style={styles.activeDot} />
        <View style={styles.iconBadge}>
          <Icon name="users" size={compact ? 18 : 22} color={colors.accent} />
        </View>
      </View>

      {/* Circle Info */}
      <View style={styles.centerSection}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>ACTIVE CIRCLE</Text>
          <View style={styles.lockBadge}>
            <Icon name="lock" size={10} color={colors.textMuted} />
            <Text style={styles.lockText}>Private</Text>
          </View>
        </View>
        <Text style={styles.circleName} numberOfLines={1}>
          {circle.name}
        </Text>
        {!compact && circle.description && (
          <Text style={styles.circleDescription} numberOfLines={1}>
            {circle.description}
          </Text>
        )}
      </View>

      {/* Arrow */}
      {onPress && (
        <View style={styles.rightSection}>
          <Icon name="arrow-right" size={20} color={colors.textMuted} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.accent,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }),
    },
    bannerCompact: {
      padding: spacing.sm,
    },
    leftSection: {
      position: 'relative',
    },
    activeDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.surface,
      zIndex: 1,
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: radius.lg,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerSection: {
      flex: 1,
      gap: 2,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    label: {
      ...typography.mono.micro,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 1,
      fontSize: 10,
    },
    lockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.sm,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    lockText: {
      ...typography.mono.micro,
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
    },
    circleName: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    circleDescription: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      marginTop: 1,
    },
    rightSection: {
      paddingLeft: spacing.xs,
    },
  });
}
