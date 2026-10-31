import React from 'react';
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
  floating?: boolean;
};

export function SearchBar({
  placeholder = 'Search your memories…',
  value,
  onChangeText,
  onSubmit,
  onClear,
  style,
  autoFocus = false,
  floating = false,
}: SearchBarProps) {
  const hasText = value.length > 0;

  return (
    <View style={[styles.container, floating && styles.containerFloating, style]}>
      <View style={styles.inputWrapper}>
        <Icon name="search" size={17} color={colors.textSecondary} />
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
  containerFloating: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 38,
  },
  input: {
    flex: 1,
    ...typography.sans.subheadline,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    fontSize: 16,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
