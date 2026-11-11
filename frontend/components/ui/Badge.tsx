import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, borders, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type BadgeProps = {
  label: string;
  tone?: 'primary' | 'neutral' | 'success' | 'accent' | 'subtle' | 'chrome';
  size?: 'sm' | 'md';
};

export function Badge({ label, tone = 'neutral', size = 'md' }: BadgeProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const sizeStyles = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const toneStyles = {
    primary: styles.tonePrimary,
    neutral: styles.toneNeutral,
    success: styles.toneSuccess,
    accent: styles.toneAccent,
    subtle: styles.toneSubtle,
    chrome: styles.toneChrome,
  }[tone];

  const sizeTextStyles = size === 'sm' ? styles.sizeSmText : styles.sizeMdText;
  const toneTextStyles = {
    primary: styles.tonePrimaryText,
    neutral: styles.toneNeutralText,
    success: styles.toneSuccessText,
    accent: styles.toneAccentText,
    subtle: styles.toneSubtleText,
    chrome: styles.toneChromeText,
  }[tone];

  return (
    <View style={[styles.badge, sizeStyles, toneStyles]}>
      <Text style={[styles.text, sizeTextStyles, toneTextStyles]}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radius.round,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sizeSm: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      gap: 4,
    },
    sizeMd: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: 4,
    },
    tonePrimary: {
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.hairline,
      borderColor: 'rgba(128, 82, 200, 0.25)',
    },
    toneNeutral: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: borders.hairline,
      borderColor: colors.borderDefault,
    },
    toneSuccess: {
      backgroundColor: colors.successSoft,
      borderWidth: borders.hairline,
      borderColor: 'rgba(58, 143, 90, 0.2)',
    },
    toneAccent: {
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.hairline,
      borderColor: 'rgba(128, 82, 200, 0.25)',
    },
    toneSubtle: {
      backgroundColor: 'transparent',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    toneChrome: {
      backgroundColor: colors.chromeDark,
      borderWidth: borders.thin,
      borderColor: colors.chrome,
    },
    text: {
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      fontFamily: 'System',
    },
    sizeSmText: {
      fontSize: 10,
    },
    sizeMdText: {
      fontSize: 11,
    },
    tonePrimaryText: {
      color: colors.accent,
    },
    toneNeutralText: {
      color: colors.textSecondary,
    },
    toneSuccessText: {
      color: colors.success,
    },
    toneAccentText: {
      color: colors.accent,
    },
    toneSubtleText: {
      color: colors.textMuted,
    },
    toneChromeText: {
      color: colors.textOnChrome,
    },
  });
}
