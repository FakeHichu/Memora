import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography, radius, borders } from '@/constants/theme';
import { Icon, type JamIconName } from '@/components/ui/Icons';

type EmptyStateVariant = 
  | 'default' 
  | 'camera' 
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

const variantConfig: Record<EmptyStateVariant, { icon: string; illustrationColor: string }> = {
  default: { icon: 'cloud', illustrationColor: colors.textMuted },
  camera: { icon: 'camera', illustrationColor: colors.accent },
  search: { icon: 'search', illustrationColor: colors.accentLavender },
  calendar: { icon: 'calendar', illustrationColor: colors.chromeDim },
  star: { icon: 'star', illustrationColor: colors.warning },
  users: { icon: 'users', illustrationColor: colors.accent },
  folder: { icon: 'file', illustrationColor: colors.accentLavender },
  photo: { icon: 'picture', illustrationColor: colors.accent },
  bell: { icon: 'bell', illustrationColor: colors.warning },
  cloud: { icon: 'cloud', illustrationColor: colors.chromeDim },
  prompt: { icon: 'calendar', illustrationColor: colors.accent },
};

function EmptyStateIllustration({ variant, color, size = 80 }: { variant: EmptyStateVariant; color: string; size?: number }) {
  // Custom illustrated empty states using our icon system with enhanced styling
  const icons: Record<EmptyStateVariant, JamIconName> = {
    default: 'cloud',
    camera: 'camera',
    search: 'search',
    calendar: 'calendar',
    star: 'star',
    users: 'users',
    folder: 'file',
    photo: 'picture',
    bell: 'bell',
    cloud: 'cloud',
    prompt: 'calendar',
  };

  return (
    <View style={[styles.illustrationWrapper, { width: size, height: size }]}>
      <View style={[styles.illustrationBg, { backgroundColor: `${color}15`, width: size, height: size }]}>
        <Icon name={icons[variant]} size={size * 0.5} color={color} opacity={0.6} />
      </View>
      <View style={[styles.illustrationRing, { borderColor: `${color}40`, width: size, height: size }]} />
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
  const config = variantConfig[variant];
  const effectiveColor = config.illustrationColor;

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel || title}
    >
      {illustration ? (
        illustration
      ) : (
        <EmptyStateIllustration variant={variant} color={effectiveColor} size={96} />
      )}
      
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      
      {(action || secondaryAction) && (
        <View style={styles.actionsContainer}>
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
          {action && (
            <Pressable
              onPress={action.onPress}
              style={[
                styles.actionButton,
                action.variant === 'secondary' && styles.actionButtonSecondary,
                action.variant === 'primary' && styles.actionButtonPrimary,
              ]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={[
                styles.actionLabel,
                action.variant === 'secondary' && styles.actionLabelSecondary,
                action.variant === 'primary' && styles.actionLabelPrimary,
              ]}>
                {action.label}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  illustrationWrapper: {
    position: 'relative',
  },
  illustrationBg: {
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: radius.circle,
    borderWidth: borders.thin,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: 320,
  },
  message: {
    ...typography.sans.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(122, 159, 216, 0.15)',
    borderRadius: radius.round,
    minWidth: 140,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionButtonSecondary: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderDefault,
  },
  actionLabel: {
    ...typography.sans.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  actionLabelPrimary: {
    color: colors.textInverse,
  },
  actionLabelSecondary: {
    color: colors.textPrimary,
  },
  secondaryActionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.round,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryActionLabel: {
    ...typography.sans.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});