import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
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

  const isCreateTab = (routeName: string) => routeName === 'create';

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
        {MAIN_TABS.map((tab, index) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.routeName);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const isCreate = isCreateTab(tab.routeName);

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

          // Render center create button differently
          if (isCreate) {
            return (
              <Pressable
                key={tab.routeName}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={tab.label}
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.createButtonPressed,
                ]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <View style={styles.createIconCircle}>
                  <Icon
                    name={tab.iconName}
                    size={28}
                    color={colors.textInverse}
                  />
                </View>
              </Pressable>
            );
          }

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
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
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
    },
    // Larger create button styles
    createButton: {
      marginHorizontal: 4,
      transitionDuration: '200ms',
    } as any,
    createButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.92 }],
    },
    createIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: isDark ? colors.accentLight : colors.accentDeep,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 4px 20px rgba(128, 82, 200, 0.5), 0 2px 8px rgba(128, 82, 200, 0.3)'
              : '0 4px 20px rgba(128, 101, 143, 0.4), 0 2px 8px rgba(128, 101, 143, 0.25)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          }),
    },
  });
}
