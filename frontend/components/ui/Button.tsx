import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary, variant === 'ghost' && styles.labelGhost]}>{title}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  labelSecondary: {
    color: colors.primaryDark,
  },
  labelGhost: {
    color: colors.text,
  },
  });
}
