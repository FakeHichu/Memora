import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';

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

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
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
      {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
      <Text
        style={[
          styles.label,
          variant === 'ghost' && styles.labelGhost,
          variant === 'destructive' && styles.labelDestructive,
          variant === 'subtle' && styles.labelSubtle,
          variant === 'chrome' && styles.labelChrome,
          sizeTextStyles,
        ]}
      >
        {title}
      </Text>
      {rightIcon && <Text style={styles.icon}>{rightIcon}</Text>}
    </Pressable>
  );
}

const baseShadow = Platform.OS === 'web' ? webShadows.sm : shadows.sm;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...baseShadow,
  },
  sizeSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  sizeMd: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  sizeLg: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  variantPrimary: {
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
  },
  variantSecondary: {
    backgroundColor: colors.surface,
    borderWidth: borders.thin,
    borderColor: colors.borderChrome,
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  variantChrome: {
    backgroundColor: colors.chrome,
    borderWidth: 0,
  },
  variantAccent: {
    backgroundColor: colors.accent,
    borderWidth: 0,
    ...shadows.glowSm,
  },
  variantDestructive: {
    backgroundColor: colors.errorSoft,
    borderWidth: borders.hairline,
    borderColor: colors.error,
  },
  variantSubtle: {
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(184, 79, 125, 0.2)',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'System',
  },
  sizeSmText: {
    fontSize: 13,
  },
  sizeMdText: {
    fontSize: 16,
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
  labelChrome: {
    color: colors.textOnChrome,
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
  },
});
