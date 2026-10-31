import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borders, colors, radius, spacing, shadows, webShadows } from '@/constants/theme';
import { TabIcon } from '@/components/ui/Icons';

const MIN_TAB_BAR_HEIGHT = 54;
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
            <View style={styles.iconContainer}>
              <TabIcon
                name="home"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
                size={22}
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
            <View style={styles.iconContainer}>
              <TabIcon
                name="calendar"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
                size={22}
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
                activeColor="#FFFFFF"
                inactiveColor="#FFFFFF"
                size={24}
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
            <View style={styles.iconContainer}>
              <TabIcon
                name="users"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
                size={22}
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
            <View style={styles.iconContainer}>
              <TabIcon
                name="user"
                focused={focused}
                activeColor={colors.accent}
                inactiveColor={colors.textMuted}
                size={22}
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderTopWidth: borders.hairline,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          ...webShadows.md,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      : { ...shadows.md }),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  iconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconContainer: {
    width: 46,
    height: 46,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
    marginTop: -10,
    backgroundColor: colors.accent,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)' }
      : { ...shadows.glowSm, ...shadows.sm }),
  },
  createIconContainerFocused: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 1.05 }],
  },
});
