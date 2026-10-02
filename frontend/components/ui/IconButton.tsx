import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';

import { colors, radius, borders, shadows, webShadows } from '@/constants/theme';

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
    accent: colors.textInverse,
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

const baseShadow = Platform.OS === 'web' ? webShadows.sm : shadows.sm;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.circle,
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
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  variantChrome: {
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
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
    borderColor: colors.borderChrome,
  },
  variantOverlay: {
    backgroundColor: 'rgba(9, 9, 12, 0.6)',
    borderWidth: borders.hairline,
    borderColor: 'rgba(191, 195, 204, 0.1)',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontWeight: '300',
  },
});
