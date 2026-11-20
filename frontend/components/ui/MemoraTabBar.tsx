import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  { routeName: 'create', label: '', iconName: 'plus' },
  { routeName: 'memories', label: 'Notifications', iconName: 'bell' },
  { routeName: 'profile', label: 'Profile', iconName: 'user' },
];

export function MemoraTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);

  const bottomInset = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 12)
    : Math.max(insets.bottom, 12);

  const currentRouteName = state?.routes?.[state?.index]?.name || 'home';

  // Smooth scale animation on central create button press
  const createScale = useRef(new Animated.Value(1)).current;

  const handleCreatePressIn = () => {
    Animated.spring(createScale, {
      toValue: 0.92,
      useNativeDriver: Platform.OS !== 'web',
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handleCreatePressOut = () => {
    Animated.spring(createScale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 24,
      bounciness: 8,
    }).start();
  };

  // Soft, readable inactive colors (lit and visible, but not over-lit)
  const inactiveIconColor = isDark ? 'rgba(220, 228, 250, 0.82)' : '#4C4F69';
  const inactiveTextColor = isDark ? 'rgba(220, 228, 250, 0.82)' : '#5C5F77';

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: bottomInset,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* ── Liquid Frosted Glass Navigation Pill Dock ── */}
      <View style={styles.glassDock} accessibilityRole="tablist">
        {/* Specular Liquid Light Sheen along Top Rim */}
        <View style={styles.specularRimSheen} />

        {MAIN_TABS.map((tab) => {
          const isFocused =
            currentRouteName === tab.routeName ||
            currentRouteName.startsWith(tab.routeName);

          const isCreate = tab.routeName === 'create';

          const onPress = () => {
            const matchingRoute = state?.routes?.find(
              (r) => r.name === tab.routeName || r.name.includes(tab.routeName),
            );

            if (matchingRoute) {
              const event = navigation.emit({
                type: 'tabPress',
                target: matchingRoute.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(matchingRoute.name);
              }
            } else {
              navigation.navigate(tab.routeName);
            }
          };

          // ── Proportional Central Create (+) Button ──
          if (isCreate) {
            return (
              <View key={tab.routeName} style={styles.createButtonSlot}>
                <Pressable
                  onPress={onPress}
                  onPressIn={handleCreatePressIn}
                  onPressOut={handleCreatePressOut}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel="Create Memory"
                  hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                >
                  <Animated.View
                    style={[
                      styles.createButtonWrapper,
                      { transform: [{ scale: createScale }] },
                    ]}
                  >
                    {/* Ambient Glow Halo behind the button */}
                    <View style={styles.createGlowHalo} />

                    {/* Elevated Liquid Glass Orb (Clean, No Distracting Bar Artifact) */}
                    <View style={styles.createLiquidOrb}>
                      <Icon
                        name={tab.iconName}
                        size={21}
                        color="#FFFFFF"
                      />
                    </View>
                  </Animated.View>
                </Pressable>
              </View>
            );
          }

          // ── Regular Navigation Tabs (Clear, Fully Legible, Reference Match) ──
          return (
            <Pressable
              key={tab.routeName}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
              style={({ pressed }) => [
                styles.tabSlot,
                pressed && styles.tabSlotPressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              {/* Active Tab has glowing frosted glass capsule; Inactive tab floats cleanly */}
              <View
                style={[
                  styles.tabContentWrap,
                  isFocused ? styles.activeGlassCapsule : styles.inactiveTabWrap,
                ]}
              >
                {/* Specular Top Edge on Active Capsule */}
                {isFocused && <View style={styles.capsuleSpecularEdge} />}

                {/* Tab Icon */}
                <View style={styles.tabIconWrap}>
                  <Icon
                    name={tab.iconName}
                    size={20}
                    color={isFocused ? colors.accent : inactiveIconColor}
                  />
                </View>

                {/* Tab Label (Clearly Visible, Softly Lit, Not Over-lit) */}
                {tab.label ? (
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused
                        ? styles.tabLabelActive
                        : [styles.tabLabelInactive, { color: inactiveTextColor }],
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  // Translucent liquid glass colors matching Catppuccin Mocha & Latte
  const dockBackground = isDark
    ? 'rgba(24, 24, 37, 0.78)' // Translucent Catppuccin Mocha Mantle
    : 'rgba(230, 233, 239, 0.80)'; // Translucent Catppuccin Latte Mantle

  const dockBorderColor = isDark
    ? 'rgba(180, 190, 254, 0.22)' // Subtle lavender liquid rim
    : 'rgba(255, 255, 255, 0.90)'; // Frosted white liquid rim

  // Active Capsule colors from reference image
  const activeCapsuleBg = isDark
    ? 'rgba(180, 190, 254, 0.20)' // Soft luminous lavender frosted glass
    : 'rgba(114, 135, 253, 0.20)';

  const activeCapsuleBorder = isDark
    ? 'rgba(255, 255, 255, 0.32)'
    : 'rgba(255, 255, 255, 0.95)';

  // Center button colors
  const createOrbBg = isDark
    ? colors.accent // #B4BEFE Midnight Lavender
    : colors.accent; // #7287FD Latte Lavender

  const createGlowColor = isDark
    ? 'rgba(180, 190, 254, 0.35)'
    : 'rgba(114, 135, 253, 0.30)';

  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      zIndex: 9999,
      elevation: 24,
    },
    glassDock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 480,
      height: 64, // Proportional height matching reference
      backgroundColor: dockBackground,
      borderRadius: 32,
      paddingHorizontal: 6,
      borderWidth: 1.2,
      borderColor: dockBorderColor,
      position: 'relative',
      overflow: 'visible',
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            boxShadow: isDark
              ? '0 16px 40px rgba(0, 0, 0, 0.70), 0 2px 12px rgba(180, 190, 254, 0.14), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)'
              : '0 16px 36px rgba(76, 79, 105, 0.16), 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          } as any)
        : {
            shadowColor: isDark ? '#000000' : '#4C4F69',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.45 : 0.16,
            shadowRadius: 20,
            elevation: 16,
          }),
    },
    specularRimSheen: {
      position: 'absolute',
      top: 0,
      left: 28,
      right: 28,
      height: 1.5,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.35)'
        : 'rgba(255, 255, 255, 0.98)',
      borderRadius: 1,
    },

    // ── Tab Item Slots ──
    tabSlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minWidth: 0,
    },
    tabSlotPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },

    // ── Tab Content Container ──
    tabContentWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    // Unselected tabs float naturally without clipping
    inactiveTabWrap: {
      width: '100%',
      paddingVertical: 4,
    },
    // Active tab is wrapped in the compact frosted glass capsule
    activeGlassCapsule: {
      width: 62,
      height: 48,
      borderRadius: 24,
      backgroundColor: activeCapsuleBg,
      borderWidth: 1,
      borderColor: activeCapsuleBorder,
      position: 'relative',
      overflow: 'hidden',
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark
              ? '0 4px 14px rgba(180, 190, 254, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.35)'
              : '0 4px 12px rgba(114, 135, 253, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }),
    },
    capsuleSpecularEdge: {
      position: 'absolute',
      top: 0,
      left: 10,
      right: 10,
      height: 1.2,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.55)'
        : 'rgba(255, 255, 255, 0.98)',
      borderRadius: 1,
    },

    tabIconWrap: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 10.5,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    tabLabelActive: {
      color: colors.accent,
      fontWeight: '700',
    },
    // Clear, visible, soft-lit inactive label (not washed out)
    tabLabelInactive: {
      fontWeight: '600',
    },

    // ── Signature Proportional Elevated Central Create (+) Button ──
    createButtonSlot: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 52,
      zIndex: 1000,
    },
    createButtonWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginTop: -10, // Proportional elevation matching the reference image
    },
    createGlowHalo: {
      position: 'absolute',
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: createGlowColor,
      opacity: 0.45,
      transform: [{ scale: 1.1 }],
    },
    createLiquidOrb: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: createOrbBg,
      borderWidth: 1.2,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.50)'
        : 'rgba(255, 255, 255, 0.95)',
      borderTopColor: isDark
        ? 'rgba(255, 255, 255, 0.85)'
        : '#FFFFFF',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 18px rgba(180, 190, 254, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.4)'
              : '0 6px 18px rgba(114, 135, 253, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.55,
            shadowRadius: 10,
            elevation: 10,
          }),
    },
  });
}
