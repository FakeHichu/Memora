import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
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
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const hasText = value.length > 0;

  return (
    <View style={[styles.container, floating && styles.containerFloating, style]}>
      <View style={styles.pillTrack}>
        <View style={styles.leftIconContainer}>
          <Icon name="search" size={19} color={colors.textSecondary} />
        </View>

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
          returnKeyType="search"
        />

        {hasText && onClear ? (
          <Pressable
            onPress={onClear}
            style={styles.actionPillButton}
            accessibilityLabel="Clear search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={14} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onSubmit ? () => onSubmit(value) : undefined}
            style={styles.actionPillButton}
            accessibilityLabel="Search"
          >
            <Icon name="search" size={16} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
    },
    containerFloating: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    pillTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 18px rgba(48, 36, 61, 0.05)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 8,
            elevation: 2,
          }),
    },
    leftIconContainer: {
      paddingLeft: 10,
      paddingRight: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      ...typography.sans.body,
      color: colors.textPrimary,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: 15,
    },
    actionPillButton: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: colors.surfaceOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
  });
}
