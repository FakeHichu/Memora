import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { TabIcon, type JamIconName } from '@/components/ui/Icons';
import { useAppTheme } from '@/providers/ThemeProvider';
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
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // Floating pill container — anchored to the bottom of the screen,
    // lifted above the safe area, centered horizontally.
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
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
    },
  });
}
