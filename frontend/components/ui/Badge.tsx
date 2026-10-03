import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type BadgeProps = {
  label: string;
  tone?: 'primary' | 'neutral' | 'success';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone === 'neutral' && styles.textNeutral, tone === 'success' && styles.textSuccess]}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
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
    textTransform: 'uppercase',
  },
  textNeutral: {
    color: colors.text,
  },
  textSuccess: {
    color: colors.neon,
  },
  });
}
