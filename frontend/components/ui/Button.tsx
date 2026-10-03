import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from 'react-native';

<<<<<<< HEAD
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
=======
import { colors, radius, spacing, shadows, webShadows, borders, variants } from '@/constants/theme';
>>>>>>> origin/swish

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

<<<<<<< HEAD
export function Button({ title, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
=======
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
>>>>>>> origin/swish

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
<<<<<<< HEAD
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary, variant === 'ghost' && styles.labelGhost]}>{title}</Text>
=======
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
>>>>>>> origin/swish
    </Pressable>
  );
}

<<<<<<< HEAD
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
=======
const baseShadow = Platform.OS === 'web' ? webShadows.sm : shadows.sm;

const styles = StyleSheet.create({
>>>>>>> origin/swish
  base: {
    borderRadius: radius.sm,
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
  // Primary — Chrome dim surface with chrome border
  variantPrimary: {
    backgroundColor: variants.button.primary.backgroundColor,
    borderWidth: borders.thin,
    borderColor: variants.button.primary.borderColor,
  },
  // Secondary — Elevated surface with subtle border
  variantSecondary: {
    backgroundColor: variants.button.secondary.backgroundColor,
    borderWidth: borders.hairline,
    borderColor: variants.button.secondary.borderColor,
  },
  // Ghost — Transparent with subtle border
  variantGhost: {
    backgroundColor: variants.button.ghost.backgroundColor,
    borderWidth: borders.hairline,
    borderColor: variants.button.ghost.borderColor,
  },
  // Chrome — Full chrome surface
  variantChrome: {
    backgroundColor: variants.button.chrome.backgroundColor,
    borderWidth: 0,
  },
  // Accent — Icy blue primary action
  variantAccent: {
    backgroundColor: variants.button.accent.backgroundColor,
    borderWidth: 0,
    ...shadows.glowSm,
  },
  // Destructive — Muted error tone
  variantDestructive: {
    backgroundColor: variants.button.destructive.backgroundColor,
    borderWidth: borders.hairline,
    borderColor: variants.button.destructive.borderColor,
  },
  // Subtle — Accent tint for secondary actions
  variantSubtle: {
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(122, 159, 216, 0.15)',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
<<<<<<< HEAD
    color: colors.onPrimary,
    fontSize: 16,
=======
    color: colors.textPrimary,
>>>>>>> origin/swish
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
  labelSecondary: {
    color: colors.primaryDark,
  },
  labelGhost: {
    color: colors.accent,
  },
<<<<<<< HEAD
  });
}
=======
  labelDestructive: {
    color: colors.error,
  },
  labelSubtle: {
    color: colors.accent,
  },
  labelChrome: {
    color: colors.textInverse,
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
  },
});
>>>>>>> origin/swish
