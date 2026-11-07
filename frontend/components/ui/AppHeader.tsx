import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';
type HeaderAction = {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
  badge?: number;
};
type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  greeting?: string;
  userName?: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  actions?: HeaderAction[];
  avatar?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
};
export function AppHeader({
  title,
  subtitle,
  greeting,
  userName,
  leftAction,
  rightAction,
  actions,
  avatar,
  style,
  transparent = true,
}: AppHeaderProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode, transparent);
  if (avatar && greeting) {
    return (
      <View style={[styles.modernContainer, style]}>
        {/* Top Profile + Actions Row */}
        <View style={styles.topRow}>
          <View style={styles.profileBlock}>
            {avatar}
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.userNameText} numberOfLines={1}>
                {userName || 'Memory Keeper'}
              </Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            {actions && actions.length > 0 ? (
              actions.map((act, i) => (
                <Pressable
                  key={i}
                  onPress={act.onPress}
                  style={({ pressed }) => [
                    styles.circleActionButton,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={act.accessibilityLabel || 'Action'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name={act.icon as any} size={20} color={colors.textPrimary} />
                  {act.badge && act.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{act.badge > 9 ? '9+' : act.badge}</Text>
                    </View>
                  )}
                </Pressable>
              ))
            ) : rightAction ? (
              <Pressable
                onPress={rightAction.onPress}
                style={({ pressed }) => [
                  styles.circleActionButton,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name={rightAction.icon as any} size={20} color={colors.textPrimary} />
                {rightAction.badge && rightAction.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{rightAction.badge > 9 ? '9+' : rightAction.badge}</Text>
                  </View>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
        {/* Big Bold Greeting Title */}
        {title && (
          <View style={styles.bigTitleBlock}>
            <Text style={styles.bigTitleText}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>
    );
  }
  return (
    <View style={[styles.container, style]}>
      <View style={styles.navRow}>
        {leftAction ? (
          <Pressable
            onPress={leftAction.onPress}
            style={({ pressed }) => [
              styles.circleActionButton,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={leftAction.accessibilityLabel || 'Back'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name={leftAction.icon as any} size={18} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.circlePlaceholder} />
        )}
        <View style={styles.centerTitleContainer}>
          <Text style={styles.centerTitleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.actionsRow}>
          {actions && actions.length > 0 ? (
            actions.map((act, i) => (
              <Pressable
                key={i}
                onPress={act.onPress}
                style={({ pressed }) => [
                  styles.circleActionButton,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={act.accessibilityLabel || 'Action'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name={act.icon as any} size={18} color={colors.textPrimary} />
              </Pressable>
            ))
          ) : rightAction ? (
            <Pressable
              onPress={rightAction.onPress}
              style={({ pressed }) => [
                styles.circleActionButton,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={rightAction.icon as any} size={18} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={styles.circlePlaceholder} />
          )}
        </View>
      </View>
      {subtitle && (
        <View style={styles.subtextBlock}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
}
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light', transparent: boolean) {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    modernContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: 'transparent',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    profileBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    greetingBlock: {
      justifyContent: 'center',
    },
    greetingText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    userNameText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    circleActionButton: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(48, 36, 61, 0.05)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.25 : 0.05,
            shadowRadius: 4,
            elevation: 2,
          }),
    },
    circlePlaceholder: {
      width: 44,
      height: 44,
    },
    bigTitleBlock: {
      marginTop: 2,
      marginBottom: 6,
    },
    bigTitleText: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.6,
      lineHeight: 38,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    container: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      backgroundColor: 'transparent',
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
    },
    centerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    centerTitleText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    subtextBlock: {
      alignItems: 'center',
      marginTop: 4,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 999,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.94 }],
    },
  });
}