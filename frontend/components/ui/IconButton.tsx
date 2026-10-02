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
    chrome: colors.textInverse,
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
  // Default — Floating surface
  variantDefault: {
    backgroundColor: colors.surfaceFloating,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  // Chrome — Chrome dim surface with chrome border
  variantChrome: {
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
  },
  // Accent — Accent surface
  variantAccent: {
    backgroundColor: colors.accent,
    borderWidth: 0,
    ...shadows.glowSm,
  },
  // Ghost — Transparent with subtle border
  variantGhost: {
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  // Overlay — Dark translucent for on-content controls
  variantOverlay: {
    backgroundColor: 'rgba(8, 8, 12, 0.6)',
    borderWidth: borders.hairline,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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