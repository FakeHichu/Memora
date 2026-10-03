import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

const tabItems = [
  { routeName: 'today', label: 'Home', icon: '⌂' },
  { routeName: 'discover', label: 'Discover', icon: '⌕' },
  { routeName: 'memories', label: 'Memories', icon: '▤' },
  { routeName: 'profile', label: 'Me', icon: '○' },
] as const;

export function MemoraTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const sideItems = [tabItems[0], tabItems[1], tabItems[2], tabItems[3]];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {sideItems.slice(0, 2).map((item) => {
        const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
        const route = state.routes[routeIndex];
        const focused = state.index === routeIndex;

        return (
          <Pressable
            key={item.routeName}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route?.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(item.routeName);
            }}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: focused }}
          >
            <Text style={[styles.icon, focused && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, focused && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}

      <Pressable
        style={styles.createTab}
        onPress={() => router.push('/camera')}
        accessibilityRole="button"
        accessibilityLabel="Create a moment"
      >
        <View style={styles.createButton}><Text style={styles.createIcon}>+</Text></View>
        <Text style={styles.createLabel}>Create</Text>
      </Pressable>

      {sideItems.slice(2).map((item) => {
        const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
        const route = state.routes[routeIndex];
        const focused = state.index === routeIndex;

        return (
          <Pressable
            key={item.routeName}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route?.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(item.routeName);
            }}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: focused }}
          >
            <Text style={[styles.icon, focused && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, focused && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  bar: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    backgroundColor: colors.glassStrong,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  icon: {
    color: colors.muted,
    fontSize: 22,
    lineHeight: 27,
  },
  iconActive: {
    color: colors.accent,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  createTab: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  createButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  createIcon: {
    color: colors.onPrimary,
    fontSize: 29,
    fontWeight: '400',
    lineHeight: 33,
  },
  createLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '700',
  },
  });
}
