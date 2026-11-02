import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon, type JamIconName } from './Icons';

export type BottomNavTab = {
  name: string;
  label?: string;
  iconName: JamIconName;
};

const DEFAULT_TABS: BottomNavTab[] = [
  { name: 'Home', iconName: 'home' },
  { name: 'Memories', iconName: 'picture' },
  { name: 'Add', iconName: 'plus' },
  { name: 'Circle', iconName: 'users' },
  { name: 'Profile', iconName: 'user' },
];

export type BottomNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
  tabs?: BottomNavTab[];
  style?: ViewStyle;
};

export function BottomNavigation({
  activeTab,
  onTabPress,
  tabs = DEFAULT_TABS,
  style,
}: BottomNavProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, style]}>
      <View style={styles.navBar} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const isActive =
            activeTab.toLowerCase() === tab.name.toLowerCase() ||
            activeTab.toLowerCase() === (tab.label || '').toLowerCase();
          const isAdd = tab.name.toLowerCase() === 'add' || tab.name.toLowerCase() === 'create';

          let buttonStyle = styles.inactiveCircle;
          let iconColor = styles.inactiveIconColor.color;
          let iconSize = 20;

          if (isAdd) {
            buttonStyle = styles.createCircle;
            iconColor = styles.createIconColor.color;
            iconSize = 22;
          } else if (isActive) {
            buttonStyle = styles.activeCircle;
            iconColor = styles.activeIconColor.color;
            iconSize = 20;
          }

          return (
            <Pressable
              key={tab.name}
              onPress={() => onTabPress(tab.name)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label || tab.name}
              style={({ pressed }) => [
                styles.circleButton,
                buttonStyle,
                pressed && styles.pressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Icon name={tab.iconName} size={iconSize} color={iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Default export alias matching user snippet `export default function BottomNav`
export default BottomNavigation;

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';

  const navBg = isDark ? 'rgba(30, 22, 46, 0.72)' : 'rgba(48, 36, 61, 0.78)';
  const navBorder = isDark ? 'rgba(203, 166, 247, 0.30)' : 'rgba(128, 101, 143, 0.32)';

  const activeBg = isDark ? '#CBA6F7' : '#FFFDF8';
  const activeTextColor = isDark ? '#1E1E2E' : '#261D32';

  const inactiveBg = 'rgba(255, 255, 255, 0.10)';
  const inactiveBorder = 'rgba(255, 255, 255, 0.10)';
  const inactiveTextColor = isDark ? '#A6ADC8' : '#D1C7DF';

  const createBg = isDark ? '#CBA6F7' : '#80658F';
  const createTextColor = isDark ? '#1E1E2E' : '#FFFFFF';

  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 24,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      pointerEvents: 'box-none',
      paddingHorizontal: 16,
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: navBg,
      borderRadius: 999,
      padding: 6,
      gap: 6,
      borderWidth: 1,
      borderColor: navBorder,
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 14,
          }),
    },
    circleButton: {
      width: 42,
      height: 42,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeCircle: {
      backgroundColor: activeBg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.28)',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 4px 14px rgba(203, 166, 247, 0.40)'
              : '0 4px 14px rgba(0, 0, 0, 0.20)',
          } as any)
        : {
            shadowColor: isDark ? '#CBA6F7' : '#000000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 4,
          }),
    },
    inactiveCircle: {
      backgroundColor: inactiveBg,
      borderWidth: 1,
      borderColor: inactiveBorder,
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
          } as any)
        : {}),
    },
    createCircle: {
      backgroundColor: createBg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.45)',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 18px rgba(203, 166, 247, 0.50)'
              : '0 6px 18px rgba(128, 101, 143, 0.40)',
          } as any)
        : {
            shadowColor: isDark ? '#CBA6F7' : '#80658F',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 8,
            elevation: 6,
          }),
    },
    activeIconColor: {
      color: activeTextColor,
    },
    inactiveIconColor: {
      color: inactiveTextColor,
    },
    createIconColor: {
      color: createTextColor,
    },
    pressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.88,
    },
  });
}
