import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';
import { borders, shadows, webShadows } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon, type JamIconName } from '@/components/ui/Icons';
type IconButtonProps = {
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'chrome' | 'accent' | 'ghost' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
  disabled?: boolean;
};
const KNOWN_ICONS: Set<string> = new Set([
  'home',
  'calendar',
  'users',
  'user',
  'search',
  'close',
  'camera',
  'picture',
  'envelope',
  'door',
  'padlock',
  'cloud',
  'trash',
  'clock',
  'bell',
  'info',
  'file',
  'share',
  'pencil',
  'chevron-right',
  'menu',
  'arrow-left',
  'plus',
  'cog',
  'heart',
  'star',
  'bookmark',
  'tag',
  'map-marker',
]);
export function IconButton({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  style,
  accessibilityLabel,
  disabled,
}: IconButtonProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];
  const variantStyles = {
    default: styles.variantDefault,
    chrome: styles.variantChrome,
    accent: styles.variantAccent,
    ghost: styles.variantGhost,
    overlay: styles.variantOverlay,
  }[variant];
  const pressedStyle = Platform.OS === 'web' ? webShadows.xs : shadows.xs;
  const iconColors = {
    default: colors.textPrimary,
    chrome: colors.textOnChrome,
    accent: '#FFFFFF',
    ghost: colors.textSecondary,
    overlay: colors.textPrimary,
  };
  const isIconComponent = KNOWN_ICONS.has(icon);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles,
        variantStyles,
        pressed && !disabled && { ...styles.pressed, ...pressedStyle },
        disabled && styles.disabled,
        style,
      ]}
    >
      {isIconComponent ? (
        <Icon
          name={icon as JamIconName}
          size={iconSizes}
          color={iconColors[variant]}
          fill={variant === 'accent' ? '#FFFFFF' : undefined}
        />
      ) : (
        <Text style={[styles.icon, { color: iconColors[variant] }]}>{icon}</Text>
      )}
    </Pressable>
  );
}
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  const baseShadow = Platform.OS === 'web' ? webShadows.sm : shadows.sm;
  return StyleSheet.create({
    base: {
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      ...baseShadow,
    },
    sizeSm: {
      width: 38,
      height: 38,
    },
    sizeMd: {
      width: 44,
      height: 44,
    },
    sizeLg: {
      width: 54,
      height: 54,
    },
    variantDefault: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    variantChrome: {
      backgroundColor: colors.chromeDark,
      borderWidth: 1,
      borderColor: colors.chrome,
    },
    variantAccent: {
      backgroundColor: colors.accent,
      borderWidth: 0,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 4px 14px ${isDark ? 'rgba(128, 82, 200, 0.4)' : 'rgba(128, 101, 143, 0.3)'}`,
          } as any)
        : shadows.glowSm),
    },
    variantGhost: {
      backgroundColor: 'transparent',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    variantOverlay: {
      backgroundColor: isDark ? 'rgba(33, 22, 51, 0.75)' : 'rgba(255, 253, 248, 0.85)',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.94 }],
    },
    disabled: {
      opacity: 0.35,
    },
    icon: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}