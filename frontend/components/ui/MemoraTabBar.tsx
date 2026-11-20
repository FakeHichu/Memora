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
  { routeName: 'circle', label: 'Circles', iconName: 'users' },
  { routeName: 'create', label: 'Create', iconName: 'plus' },
  { routeName: 'memories', label: 'Notifications', iconName: 'bell' },
  { routeName: 'profile', label: 'Profile', iconName: 'user' },
];
export function MemoraTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, mode);
  const bottomPosition = Platform.OS === 'ios'
    ? Math.max(insets.bottom - 8, 16)
    : Math.max(insets.bottom, 20);
  const isCreateTab = (routeName: string) => routeName === 'create';
  return (
    <View
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
          if (isCreate) {
            return (
              <Pressable
                key={tab.routeName}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={tab.label}
                style={styles.createButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <View style={styles.createIconCircle}>
                  <Icon
                    name={tab.iconName}
                    size={28}
                    color={colors.textInverse}
                  />
                </View>
                <Text style={styles.inactiveLabel}>{tab.label}</Text>
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
              <Text style={[styles.activeLabel, !isFocused && styles.inactiveLabel]}>{tab.label}</Text>
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
      paddingHorizontal: 0,
    },
    navContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      backgroundColor: colors.backgroundSecondary,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingTop: 7,
      paddingBottom: 5,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderColor: colors.border,
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 0,
      paddingVertical: 0,
      flex: 1,
      minWidth: 0,
    } as any,
    tabButtonActive: {
      backgroundColor: 'transparent',
    },
    tabButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    iconCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    iconCircleActive: {
      backgroundColor: 'rgba(195,166,242,0.16)',
      borderColor: 'transparent',
      borderWidth: 0,
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
      fontSize: 9,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0,
    },
    inactiveLabel: {
      color: colors.textSecondary,
    },
    createButton: {
      marginHorizontal: 0,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
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
