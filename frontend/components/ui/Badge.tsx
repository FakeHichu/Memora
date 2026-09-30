import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type BadgeProps = {
  label: string;
  tone?: 'primary' | 'neutral' | 'success';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone === 'neutral' && styles.textNeutral]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#F0F1F3',
  },
  success: {
    backgroundColor: '#DDF3E8',
  },
  text: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textNeutral: {
    color: colors.text,
  },
});
