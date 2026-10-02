import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, shadows, webShadows, borders } from '@/constants/theme';
import { TabIcon } from '@/components/ui/Icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon name="home" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon name="calendar" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.createIconContainer,
                focused && styles.createIconContainerFocused,
              ]}
            >
              <TabIcon name="plus" focused={focused} activeColor={colors.textInverse} inactiveColor={colors.chromeDim} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: 'Circle',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon name="users" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <TabIcon name="user" focused={focused} activeColor={colors.accent} inactiveColor={colors.textMuted} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surfaceNavigation,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSubtle,
    height: 88,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web' ? webShadows.xl : shadows.xl),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
    fontFamily: 'System',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: colors.accentSubtle,
  },
  createIconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -6,
    marginTop: -10,
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 12px rgba(122, 159, 216, 0.15), 0 4px 16px rgba(0, 0, 0, 0.25)' }
      : { ...shadows.glowMd, ...shadows.md }),
  },
  createIconContainerFocused: {
    backgroundColor: colors.chrome,
    borderColor: colors.chromeHighlight,
    transform: [{ scale: 1.03 }],
  },
});