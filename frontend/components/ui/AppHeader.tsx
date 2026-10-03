import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, webShadows, borders } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  greeting?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
    badge?: number;
  };
  style?: ViewStyle;
  transparent?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  greeting,
  leftAction,
  rightAction,
  style,
  transparent = false,
}: AppHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.container, transparent && styles.containerTransparent, style]}>
        {leftAction && (
          <Pressable
            onPress={leftAction.onPress}
            style={styles.actionButton}
            accessibilityLabel={leftAction.accessibilityLabel || 'Menu'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name={leftAction.icon as any} size={22} color={colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.textContainer}>
          {greeting && <Text style={styles.greeting}>{greeting}</Text>}
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction && (
          <Pressable
            onPress={rightAction.onPress}
            style={styles.actionButton}
            accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.actionIconWrapper}>
              <Icon name={rightAction.icon as any} size={22} color={colors.textPrimary} />
              {rightAction.badge && rightAction.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {rightAction.badge > 9 ? '9+' : rightAction.badge}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      </View>
      {!transparent && <View style={styles.bottomHairline} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
    // Material 02 — Navigation surface
    backgroundColor: colors.surfaceNavigation,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.borderSubtle,
  },
  containerTransparent: {
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingTop: spacing.xs,
  },
  greeting: {
    ...typography.sans.callout,
    color: colors.textMuted,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.sans.callout,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceFloating,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    ...Platform.select({
      web: webShadows.xs,
      default: undefined,
    }),
  },
  actionIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.round,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.sans.caption2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  bottomHairline: {
    height: borders.hairline,
    backgroundColor: colors.borderSubtle,
  },
});