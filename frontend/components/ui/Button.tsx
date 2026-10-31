import React from 'react';
import { Insets, Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';

import { colors, radius, spacing, shadows, webShadows, borders } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'chrome' | 'accent' | 'destructive' | 'subtle';
  style?: ViewStyle;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  hitSlop?: Insets | number;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled,
  fullWidth = false,
  size = 'md',
  leftIcon,
  rightIcon,
  hitSlop,
}: ButtonProps) {
  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  const sizeTextStyles = {
    sm: styles.sizeSmText,
    md: styles.sizeMdText,
    lg: styles.sizeLgText,
  }[size];

  const variantStyles = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    ghost: styles.variantGhost,
    chrome: styles.variantChrome,
    accent: styles.variantAccent,
    destructive: styles.variantDestructive,
    subtle: styles.variantSubtle,
  }[variant];

  const pressedStyle = Platform.OS === 'web' ? webShadows.xs : shadows.xs;

  const isLightText = variant === 'primary' || variant === 'accent' || variant === 'chrome';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      hitSlop={hitSlop ?? (size === 'sm' ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined)}
      style={({ pressed }) => [
        styles.base,
        sizeStyles,
        variantStyles,
        fullWidth && styles.fullWidth,
        pressed && !disabled && { ...styles.pressed, ...pressedStyle },
        disabled && styles.disabled,
        style,
      ]}
    >
      {leftIcon && <Text style={[styles.icon, isLightText && styles.labelInverse]}>{leftIcon}</Text>}
      <Text
        style={[
          styles.label,
          isLightText && styles.labelInverse,
          variant === 'ghost' && styles.labelGhost,
          variant === 'destructive' && styles.labelDestructive,
          variant === 'subtle' && styles.labelSubtle,
          sizeTextStyles,
        ]}
      >
        {title}
      </Text>
      {rightIcon && <Text style={[styles.icon, isLightText && styles.labelInverse]}>{rightIcon}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 34,
    borderRadius: radius.sm,
  },
  sizeMd: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
  },
  sizeLg: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    minHeight: 52,
    borderRadius: radius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  variantPrimary: {
    backgroundColor: colors.accent,
    borderWidth: 0,
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)' } : shadows.glowSm),
  },
  variantSecondary: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 0,
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  variantChrome: {
    backgroundColor: colors.accent,
    borderWidth: 0,
  },
  variantAccent: {
    backgroundColor: colors.accent,
    borderWidth: 0,
  },
  variantDestructive: {
    backgroundColor: colors.errorSoft,
    borderWidth: borders.hairline,
    borderColor: colors.error,
  },
  variantSubtle: {
    backgroundColor: colors.accentSoft,
    borderWidth: 0,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: 'System',
  },
  labelInverse: {
    color: '#FFFFFF',
  },
  sizeSmText: {
    fontSize: 13,
  },
  sizeMdText: {
    fontSize: 15,
  },
  sizeLgText: {
    fontSize: 17,
  },
  labelGhost: {
    color: colors.accent,
  },
  labelDestructive: {
    color: colors.error,
  },
  labelSubtle: {
    color: colors.accent,
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
  },
});
