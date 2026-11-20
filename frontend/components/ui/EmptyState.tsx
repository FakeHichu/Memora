import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon, type JamIconName } from '@/components/ui/Icons';

export type EmptyStateVariant =
  | 'default'
  | 'camera'
  | 'photos'
  | 'error'
  | 'search'
  | 'calendar'
  | 'star'
  | 'users'
  | 'folder'
  | 'photo'
  | 'bell'
  | 'cloud'
  | 'prompt';

type EmptyStateProps = {
  title: string;
  message?: string;
  variant?: EmptyStateVariant;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  illustration?: React.ReactNode;
  accessibilityLabel?: string;
};

function PhotosEmptyGraphic({ color, secondaryColor }: { color: string; secondaryColor: string }) {
  return (
    <View style={{ width: 110, height: 90, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="110" height="90" viewBox="0 0 110 90" fill="none">
        {/* Back card */}
        <Rect
          x="15"
          y="15"
          width="48"
          height="60"
          rx="8"
          transform="rotate(-12 39 45)"
          fill={secondaryColor}
          opacity={0.3}
        />
        {/* Front card */}
        <Rect
          x="45"
          y="15"
          width="50"
          height="62"
          rx="8"
          transform="rotate(8 70 46)"
          fill={secondaryColor}
          opacity={0.5}
        />
        <Rect
          x="50"
          y="20"
          width="40"
          height="38"
          rx="4"
          transform="rotate(8 70 39)"
          fill={color}
          opacity={0.7}
        />
        {/* Heart sticker */}
        <Circle cx="85" cy="18" r="8" fill={color} />
        <Path
          d="M85 22 C82 19 80 17 80 15 C80 13 81 12 83 12 C84 12 84.5 13 85 14 C85.5 13 86 12 87 12 C89 12 90 13 90 15 C90 17 88 19 85 22 Z"
          fill="#11111B"
        />
      </Svg>
    </View>
  );
}

function ErrorEmptyGraphic({ color }: { color: string }) {
  return (
    <View style={{ width: 90, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="80" height="70" viewBox="0 0 80 70" fill="none">
        {/* Wi-Fi arches */}
        <Path
          d="M10 25 C28 10 52 10 70 25"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M22 38 C33 28 47 28 58 38"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Path
          d="M33 50 C37 45 43 45 47 50"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx="40" cy="60" r="4.5" fill={color} />
      </Svg>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  variant = 'default',
  icon,
  action,
  secondaryAction,
  style,
  illustration,
  accessibilityLabel,
}: EmptyStateProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);

  const renderIllustration = () => {
    if (illustration) return illustration;

    if (variant === 'photos' || variant === 'camera' || variant === 'photo' || variant === 'default') {
      return (
        <PhotosEmptyGraphic
          color={colors.accent}
          secondaryColor={mode === 'dark' ? colors.surface1 : colors.surface0}
        />
      );
    }

    if (variant === 'error' || variant === 'cloud') {
      return <ErrorEmptyGraphic color={colors.accent} />;
    }

    const iconNameMap: Record<string, JamIconName> = {
      bell: 'bell',
      users: 'users',
      search: 'search',
      star: 'star',
      folder: 'file',
      calendar: 'calendar',
      prompt: 'picture',
    };

    const iconName = iconNameMap[variant] || 'picture';

    return (
      <View style={styles.iconCircle}>
        <Icon name={iconName} size={36} color={colors.accent} />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel || title}>
      {renderIllustration()}

      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}

      {(action || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {action && (
            <Pressable
              onPress={action.onPress}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          )}

          {secondaryAction && (
            <Pressable
              onPress={secondaryAction.onPress}
              style={styles.secondaryActionButton}
              accessibilityRole="button"
              accessibilityLabel={secondaryAction.label}
            >
              <Text style={styles.secondaryActionLabel}>{secondaryAction.label}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 36,
      gap: 12,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 260,
    },
    actionsContainer: {
      width: '100%',
      maxWidth: 240,
      gap: 10,
      marginTop: 8,
    },
    actionButton: {
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.crust,
    },
    secondaryActionButton: {
      height: 44,
      borderRadius: 14,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryActionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
}
