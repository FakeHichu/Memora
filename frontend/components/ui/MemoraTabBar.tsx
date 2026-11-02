import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
<<<<<<< HEAD
=======
import { useSafeAreaInsets } from 'react-native-safe-area-context';
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4

import { TabIcon, type JamIconName } from '@/components/ui/Icons';
import { useAppTheme } from '@/providers/ThemeProvider';
<<<<<<< HEAD
import {
  borders,
  radius,
  shadows,
  spacing,
  webShadows,
  type ThemeColors,
} from '@/constants/theme';

type NavTabName = 'home' | 'memories' | 'create' | 'circle' | 'profile';

type NavTab = {
  name: NavTabName;
  label: string;
  icon: JamIconName;
};

const NAV_TABS: NavTab[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'memories', label: 'Memories', icon: 'calendar' },
  { name: 'create', label: 'Create', icon: 'plus' },
  { name: 'circle', label: 'Circle', icon: 'users' },
  { name: 'profile', label: 'Profile', icon: 'user' },
];

const ICON_SIZE = 22;
const ICON_CIRCLE_SIZE = 40;

export function MemoraTabBar(props: BottomTabBarProps) {
  const { state, navigation, insets } = props;
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const renderTab = (tab: NavTab, focused: boolean) => {
    if (tab.name === 'create') {
      return (
        <Pressable
          key={tab.name}
          style={styles.createTab}
          onPress={() => router.push('/camera')}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: true }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.createIconCircle}>
            <TabIcon
              name={tab.icon}
              focused
              size={ICON_SIZE}
              activeColor={colors.textOnPrimary}
              inactiveColor={colors.textOnPrimary}
            />
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={tab.name}
        style={styles.tab}
        onPress={() => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          const route = state.routes[routeIndex];
          const event = navigation.emit({
            type: 'tabPress',
            target: route?.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(tab.name);
        }}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: focused }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[styles.iconCircle, focused ? styles.iconCircleActive : styles.iconCircleInactive]}
        >
          <TabIcon
            name={tab.icon}
            focused={focused}
            size={ICON_SIZE}
            activeColor={colors.textOnPrimary}
            inactiveColor={colors.muted}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets?.bottom ?? 0, spacing.xs * 6) }]}
    >
      <View style={styles.pill}>
        {NAV_TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          const focused = state.index === routeIndex;
          return renderTab(tab, focused);
=======
import { Icon, type JamIconName } from './Icons';

type TabConfig = {
  routeName: string;
  label: string;
  iconName: JamIconName;
};

const MAIN_TABS: TabConfig[] = [
  { routeName: 'home', label: 'Home', iconName: 'home' },
  { routeName: 'memories', label: 'Memories', iconName: 'picture' },
  { routeName: 'create', label: 'Create', iconName: 'plus' },
  { routeName: 'circle', label: 'Circle', iconName: 'users' },
  { routeName: 'profile', label: 'Profile', iconName: 'user' },
];

export function MemoraTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, mode);

  // Calculate perfect bottom position with safe area
  const bottomPosition = Platform.OS === 'ios' 
    ? Math.max(insets.bottom - 8, 16) 
    : Math.max(insets.bottom, 20);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomPosition,
        },
      ]}
    >
      <View style={styles.navContainer} accessibilityRole="tablist">
        {MAIN_TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.routeName);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={tab.routeName}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
              style={({ pressed }) => [
                styles.tabButton,
                isFocused && styles.tabButtonActive,
                pressed && styles.tabButtonPressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <View style={[
                styles.iconCircle,
                isFocused && styles.iconCircleActive,
              ]}>
                <Icon
                  name={tab.iconName}
                  size={isFocused ? 20 : 18}
                  color={isFocused ? colors.textPrimary : colors.textSecondary}
                />
              </View>
              {isFocused && (
                <Text style={styles.activeLabel}>{tab.label}</Text>
              )}
            </Pressable>
          );
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
<<<<<<< HEAD
    // Floating pill container — anchored to the bottom of the screen,
    // lifted above the safe area, centered horizontally.
    container: {
      position: 'absolute',
      bottom: 0,
=======
    wrapper: {
      position: 'absolute',
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
<<<<<<< HEAD
      pointerEvents: 'box-none',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.round,
      backgroundColor: colors.glass,
      borderWidth: borders.thin,
      borderColor: colors.accentSoft,
      paddingVertical: spacing.xs,
      ...(Platform.OS =      ...(Platform.OS === 'web' ? webShadows.lg : shadows.lg),
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircle: {
      width: ICON_CIRCLE_SIZE,
      height: ICON_CIRCLE_SIZE,
      borderRadius: radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleActive: {
      backgroundColor: colors.accent,
      ...shadows.glowMd,
    },
    iconCircleInactive: {
      backgroundColor: colors.secondary,
      borderWidth: borders.thin,
      borderColor: colors.borderSubtle,
    },
    createTab: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    createIconCircle: {
      width: ICON_CIRCLE_SIZE,
      height: ICON_CIRCLE_SIZE,
      borderRadius: radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      shadowColor: colors.accentGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
=======
      zIndex: 999,
      pointerEvents: 'box-none',
      paddingHorizontal: 20,
    },
    navContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceNavigation : colors.card,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: isDark ? colors.borderEmphasized : colors.borderDefault,
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(48, 36, 61, 0.08), 0 2px 8px rgba(48, 36, 61, 0.04)',
          } as any)
        : {
            shadowColor: isDark ? '#000000' : colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.5 : 0.1,
            shadowRadius: 16,
            elevation: 12,
          }),
    },
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 4,
      paddingVertical: 4,
      borderRadius: 999,
      transitionDuration: '200ms',
    } as any,
    tabButtonActive: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: isDark ? colors.surface : colors.surfaceOverlay,
    },
    tabButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(48, 36, 61, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(48, 36, 61, 0.08)',
    },
    iconCircleActive: {
      backgroundColor: isDark ? colors.accent : colors.accent,
      borderColor: isDark ? colors.accentLight : colors.accentDeep,
      borderWidth: 1.5,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 2px 12px rgba(128, 82, 200, 0.4)'
              : '0 2px 12px rgba(128, 101, 143, 0.3)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          }),
    },
    activeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: -0.2,
      marginRight: 4,
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4
    },
  });
}
