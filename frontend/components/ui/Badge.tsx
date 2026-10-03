import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

<<<<<<< HEAD
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
=======
import { colors, radius, spacing, borders } from '@/constants/theme';
>>>>>>> origin/swish

type BadgeProps = {
  label: string;
  tone?: 'primary' | 'neutral' | 'success' | 'accent' | 'subtle' | 'chrome';
  size?: 'sm' | 'md';
};

<<<<<<< HEAD
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone === 'neutral' && styles.textNeutral, tone === 'success' && styles.textSuccess]}>{label}</Text>
=======
export function Badge({ label, tone = 'neutral', size = 'md' }: BadgeProps) {
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
>>>>>>> origin/swish
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
    borderColor: 'rgba(184, 79, 125, 0.2)',
  },
<<<<<<< HEAD
  neutral: {
    backgroundColor: colors.surface,
  },
  success: {
    backgroundColor: colors.success,
  },
  text: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
=======
  toneNeutral: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  toneSuccess: {
    backgroundColor: colors.successSoft,
    borderWidth: borders.hairline,
    borderColor: 'rgba(58, 143, 90, 0.2)',
  },
  toneAccent: {
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(184, 79, 125, 0.2)',
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
>>>>>>> origin/swish
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
  textSuccess: {
    color: colors.neon,
  },
  });
}
