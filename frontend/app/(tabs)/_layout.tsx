import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borders, colors, radius, spacing, shadows, webShadows } from '@/constants/theme';
import { TabIcon } from '@/components/ui/Icons';

const MIN_TAB_BAR_HEIGHT = 56;
const TAB_LABEL_HEIGHT = 16;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.xs);
  const tabBarHeight = MIN_TAB_BAR_HEIGHT + TAB_LABEL_HEIGHT + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: Platform.OS === 'android',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarAccessibilityLabel: 'Memories tab',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="calendar"
              focused={focused}
              activeColor={colors.accent}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarAccessibilityLabel: 'Create a new memory',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.createIconContainer, focused && styles.createIconContainerFocused]}>
              <TabIcon
                name="plus"
                focused={focused}
                activeColor={colors.textOnPrimary}
                inactiveColor={colors.chrome}
                size={28}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: 'Circle',
          tabBarAccessibilityLabel: 'Circle tab',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen name="class" options={{ href: null }} />
      <Tabs.Screen name="today" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="yearbook" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderWidth: borders.thin,
    borderColor: colors.borderSoft,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? webShadows.lg : shadows.lg),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'System',
    color: colors.textMuted,
  },
  createIconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
    marginTop: -8,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 18px rgba(129, 148, 123, 0.32), 0 4px 16px rgba(0, 0, 0, 0.3)' }
      : { ...shadows.glowMd, ...shadows.md }),
  },
  createIconContainerFocused: {
    backgroundColor: colors.primaryLight,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ scale: 1.03 }],
  },
});
