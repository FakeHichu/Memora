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
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon
                name="home"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarAccessibilityLabel: 'Memories tab',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon
                name="calendar"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarAccessibilityLabel: 'Create a new memory',
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.createIconContainer, focused && styles.createIconContainerFocused]}
            >
              <TabIcon
                name="plus"
                focused={focused}
                activeColor={colors.textOnChrome}
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
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon
                name="users"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon
                name="user"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
              />
            </View>
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
    backgroundColor: 'rgba(16, 16, 22, 0.88)',
    borderTopWidth: borders.hairline,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          ...webShadows.xl,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }
      : { ...shadows.xl }),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'System',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(184, 79, 125, 0.14)',
  },
  createIconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
    marginTop: -8,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 18px rgba(184, 79, 125, 0.32), 0 4px 16px rgba(0, 0, 0, 0.3)' }
      : { ...shadows.glowMd, ...shadows.md }),
  },
  createIconContainerFocused: {
    backgroundColor: colors.accentLight,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ scale: 1.03 }],
  },
});
