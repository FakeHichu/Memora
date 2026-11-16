import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon } from './Icons';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import type { Circle } from '@/hooks/useCircle';

interface CircleStatusModalProps {
  visible: boolean;
  circle: Circle | null;
  onClose: () => void;
  onViewCircle?: () => void;
}

export function CircleStatusModal({
  visible,
  circle,
  onClose,
  onViewCircle,
}: CircleStatusModalProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (!circle) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBadge}>
              <Icon name="users" size={32} color={colors.accent} />
            </View>
            <View style={styles.activeDot} />
          </View>

          {/* Title */}
          <Text style={styles.title}>You're in a Circle!</Text>
          
          {/* Circle Name */}
          <View style={styles.circleNameCard}>
            <Text style={styles.circleLabel}>ACTIVE CIRCLE</Text>
            <Text style={styles.circleName}>{circle.name}</Text>
            {circle.description && (
              <Text style={styles.circleDescription}>{circle.description}</Text>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Icon name="lock" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Photos uploaded in this circle are private and only visible to circle members
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[styles.button, styles.buttonSecondary]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <Text style={styles.buttonTextSecondary}>Got it</Text>
            </Pressable>
            
            {onViewCircle && (
              <Pressable
                onPress={() => {
                  onClose();
                  onViewCircle();
                }}
                style={[styles.button, styles.buttonPrimary]}
                accessibilityRole="button"
                accessibilityLabel="View Circle"
              >
                <Text style={styles.buttonTextPrimary}>View Circle</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 10,
          }),
    },
    iconContainer: {
      position: 'relative',
      marginBottom: spacing.lg,
    },
    iconBadge: {
      width: 72,
      height: 72,
      borderRadius: radius.round,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.accent,
    },
    activeDot: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.success,
      borderWidth: 3,
      borderColor: colors.surface,
    },
    title: {
      ...typography.serif.title,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    circleNameCard: {
      width: '100%',
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    circleLabel: {
      ...typography.mono.micro,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    circleName: {
      ...typography.serif.title2,
      color: colors.accent,
      fontWeight: '700',
      textAlign: 'center',
    },
    circleDescription: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    infoBox: {
      width: '100%',
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    infoText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
    },
    buttonSecondary: {
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    buttonPrimary: {
      backgroundColor: colors.accent,
    },
    buttonTextSecondary: {
      ...typography.sans.bodyStrong,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    buttonTextPrimary: {
      ...typography.sans.bodyStrong,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
