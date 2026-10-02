import React from 'react';
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
};

export function SearchBar({
  placeholder = 'Search your memories…',
  value,
  onChangeText,
  onSubmit,
  onClear,
  style,
  autoFocus = false,
}: SearchBarProps) {
  const hasText = value.length > 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <Icon name="search" size={18} color={colors.textMuted} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit ? () => onSubmit(value) : undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus={autoFocus}
          clearButtonMode="never"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
        />
        {hasText && onClear && (
          <Pressable onPress={onClear} style={styles.clearButton} accessibilityLabel="Clear search">
            <Icon name="close" size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    // Icon component handles sizing
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  clearButton: {
    padding: spacing.xs,
  },
});