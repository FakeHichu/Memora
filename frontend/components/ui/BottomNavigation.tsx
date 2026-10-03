import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, Text } from 'react-native';

import {
  colors,
  radius,
  spacing,
  layout,
  borders,
  typography,
  shadows,
  webShadows,
} from '@/constants/theme';
import { Platform } from 'react-native';

type TabItem = {
  name: string;
  label: string;
  icon: string;
  focusedIcon?: string;
};

type BottomNavigationProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
  style?: ViewStyle;
  createTabIndex?: number; // Index of the "create" tab that should be visually distinct
};

const TABS: TabItem[] = [
  { name: 'home', label: 'Home', icon: '🏠' },
  { name: 'memories', label: 'Memories', icon: '📅' },
  { name: 'create', label: 'Create', icon: '+' },
  { name: 'circle', label: 'Circle', icon: '👥' },
  { name: 'profile', label: 'Profile', icon: '👤' },
];

export function BottomNavigation({
  tabs = TABS,
  activeTab,
  onTabPress,
  style,
  createTabIndex = 2,
}: BottomNavigationProps) {
  return (
    <View style={[styles.tabBar, style]}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.name;
        const isCreateTab = index === createTabIndex;

        if (isCreateTab) {
          return (
            <Pressable
              key={tab.name}
              onPress={() => onTabPress(tab.name)}
              style={styles.createTab}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              hitSlop={{ top: 8, bottom: 16, left: 8, right: 8 }}
            >
              <View
                style={[styles.createIconContainer, isActive && styles.createIconContainerActive]}
              >
                <Text style={[styles.createIcon, isActive && styles.createIconActive]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[styles.createLabel, isActive && styles.createLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            hitSlop={{ top: 8, bottom: 16, left: 8, right: 8 }}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.chromeDark,
    height: layout.tabBarHeight,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 12, // Extra for safe area
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web' ? webShadows.lg : shadows.lg),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  icon: {
    fontSize: 22,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.chrome,
    fontSize: 24,
  },
  label: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: colors.chrome,
    fontWeight: '600',
  },
  createTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  createIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chromeDark,
    marginBottom: -4,
    marginTop: -8,
    ...(Platform.OS === 'web' ? webShadows.md : shadows.md),
  },
  createIconContainerActive: {
    backgroundColor: colors.chrome,
    transform: [{ scale: 1.05 }],
  },
  createIcon: {
    fontSize: 28,
    color: colors.textOnChrome,
    fontWeight: '300',
    lineHeight: 32,
  },
  createIconActive: {
    fontSize: 30,
    color: colors.textOnChrome,
  },
  createLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createLabelActive: {
    color: colors.chrome,
    fontWeight: '600',
  },
});
