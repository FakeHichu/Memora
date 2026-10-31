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
    <SafeAreaView edges={['top']} style={[styles.safeArea, transparent && styles.safeAreaTransparent]}>
      <View style={[styles.container, transparent && styles.containerTransparent, style]}>
        {leftAction && (
          <Pressable
            onPress={leftAction.onPress}
            style={styles.actionButton}
            accessibilityLabel={leftAction.accessibilityLabel || 'Menu'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name={leftAction.icon as any} size={20} color={colors.textPrimary} />
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
              <Icon name={rightAction.icon as any} size={20} color={colors.textPrimary} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
      default: undefined,
    }),
  },
  safeAreaTransparent: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  containerTransparent: {
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    ...typography.sans.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.sans.title,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  subtitle: {
    ...typography.sans.subheadline,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderWidth: borders.hairline,
    borderColor: colors.border,
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
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.round,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.sans.caption2,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 10,
  },
  bottomHairline: {
    height: borders.hairline,
    backgroundColor: colors.border,
  },
});
