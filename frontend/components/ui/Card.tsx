import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, spacing, shadows, webShadows, borders } from '@/constants/theme';

type CardProps = ViewProps & {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'editorial' | 'chrome' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
};

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  const variantStyles = {
    default: styles.variantDefault,
    elevated: styles.variantElevated,
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    editorial: styles.variantEditorial,
    chrome: styles.variantChrome,
    glass: styles.variantGlass,
  }[variant];

  const paddingStyles = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
    xl: styles.paddingXl,
  }[padding];

  const shadowStyle =
    Platform.OS === 'web'
      ? variant === 'elevated'
        ? webShadows.md
        : variant === 'editorial'
          ? webShadows.lg
          : variant === 'glass'
            ? webShadows.sm
            : webShadows.xs
      : variant === 'elevated'
        ? shadows.md
        : variant === 'editorial'
          ? shadows.lg
          : shadows.xs;

  return (
    <View {...props} style={[styles.card, variantStyles, paddingStyles, shadowStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
  },
  variantDefault: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  variantElevated: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  variantOutlined: {
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  variantFilled: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 0,
  },
  variantEditorial: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  variantChrome: {
    backgroundColor: colors.surface,
    borderWidth: borders.thin,
    borderColor: colors.accent,
  },
  variantGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderWidth: borders.hairline,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } : {}),
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: spacing.sm,
  },
  paddingMd: {
    padding: spacing.md,
  },
  paddingLg: {
    padding: spacing.lg,
  },
  paddingXl: {
    padding: spacing.xl,
  },
});
