import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

<<<<<<< HEAD
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export function Card({ children, style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

=======
import { colors, radius, spacing, shadows, webShadows, borders } from '@/constants/theme';

type CardProps = ViewProps & {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'editorial' | 'chrome' | 'glass' | 'floating' | 'modal';
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
    floating: styles.variantFloating,
    modal: styles.variantModal,
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
            : variant === 'floating'
              ? webShadows.lg
              : variant === 'modal'
                ? webShadows.xl
                : webShadows.sm
      : variant === 'elevated'
        ? shadows.md
        : variant === 'editorial'
          ? shadows.lg
          : variant === 'chrome'
            ? shadows.md
            : variant === 'floating'
              ? shadows.lg
              : variant === 'modal'
                ? shadows.xl
                : shadows.sm;

>>>>>>> origin/swish
  return (
    <View {...props} style={[styles.card, variantStyles, paddingStyles, shadowStyle, style]}>
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
<<<<<<< HEAD
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: { boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.28)' },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 22,
        elevation: 8,
      },
    }),
  },
  });
}
=======
    borderRadius: radius.xl,
  },
  // Default — Standard surface card
  variantDefault: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  // Elevated — Elevated surface, no border
  variantElevated: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 0,
  },
  // Outlined — Transparent with border
  variantOutlined: {
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  // Filled — Background secondary
  variantFilled: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 0,
  },
  // Editorial — Surface with subtle chrome accent
  variantEditorial: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.chromeGlow,
  },
  // Chrome — Chrome surface
  variantChrome: {
    backgroundColor: colors.surface,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
  },
  // Glass — Translucent floating surface (web uses backdrop-filter)
  variantGlass: {
    backgroundColor: 'rgba(17, 17, 22, 0.78)',
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  // Floating — Material 03 floating surface
  variantFloating: {
    backgroundColor: colors.surfaceFloating,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  // Modal — Material 04 modal surface
  variantModal: {
    backgroundColor: colors.surfaceModal,
    borderWidth: borders.hairline,
    borderColor: colors.borderEmphasized,
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
>>>>>>> origin/swish
