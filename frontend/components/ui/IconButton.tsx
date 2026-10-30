import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';

import { radius, borders, shadows, webShadows } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type IconButtonProps = {
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'chrome' | 'accent' | 'ghost' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function IconButton({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  style,
  accessibilityLabel,
  disabled,
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
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
    accent: colors.textOnPrimary,
    ghost: colors.textSecondary,
    overlay: colors.textPrimary,
  };

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
      <Text style={[styles.icon, { color: iconColors[variant] }]}>{icon}</Text>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  const baseShadow = Platform.OS === 'web' ? webShadows.sm : shadows.sm;

  return StyleSheet.create({
    base: {
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
      ...baseShadow,
    },
    sizeSm: {
      width: 36,
      height: 36,
    },
    sizeMd: {
      width: 44,
      height: 44,
    },
    sizeLg: {
      width: 56,
      height: 56,
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
      ...shadows.glowSm,
    },
    variantGhost: {
      backgroundColor: 'transparent',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    variantOverlay: {
      backgroundColor: 'rgba(23, 25, 29, 0.6)',
      borderWidth: borders.hairline,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.35,
    },
    icon: {
      fontWeight: '300',
    },
  });
}
