import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

import { radius, spacing, shadows, webShadows, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

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
  const { colors } = useAppTheme();

  const styles = createStyles(colors);

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
          : variant === 'chrome'
            ? webShadows.md
            : webShadows.sm
      : variant === 'elevated'
        ? shadows.md
        : variant === 'editorial'
          ? shadows.lg
          : variant === 'chrome'
            ? shadows.md
            : shadows.sm;

  return (
    <View {...props} style={[styles.card, variantStyles, paddingStyles, shadowStyle, style]}>
      {children}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.xl,
    },
    variantDefault: {
      backgroundColor: colors.card,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    variantElevated: {
      backgroundColor: colors.card,
      borderWidth: 0,
    },
    variantOutlined: {
      backgroundColor: 'transparent',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    variantFilled: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 0,
    },
    variantEditorial: {
      backgroundColor: colors.card,
      borderWidth: 0,
    },
    variantChrome: {
      backgroundColor: colors.card,
      borderWidth: borders.thin,
      borderColor: colors.chrome,
    },
    variantGlass: {
      backgroundColor: 'rgba(23, 24, 32, 0.8)',
      borderWidth: borders.hairline,
      borderColor: 'rgba(191, 195, 204, 0.1)',
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
}
