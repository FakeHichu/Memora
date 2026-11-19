import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../ui/Icons';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import type { UploadProgress } from '@/lib/photo-upload-v2';

interface UploadProgressModalProps {
  visible: boolean;
  progress: UploadProgress | null;
}

export function UploadProgressModal({ visible, progress }: UploadProgressModalProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (!progress) return null;

  const isError = progress.stage === 'error';
  const isComplete = progress.stage === 'complete';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {isError ? (
              <View style={[styles.iconBadge, styles.iconBadgeError]}>
                <Icon name="close" size={32} color={colors.error} />
              </View>
            ) : isComplete ? (
              <View style={[styles.iconBadge, styles.iconBadgeSuccess]}>
                <Icon name="star" size={32} color={colors.success} />
              </View>
            ) : (
              <View style={styles.iconBadge}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            )}
          </View>

          {/* Message */}
          <Text style={styles.message}>{progress.message}</Text>

          {/* Progress Bar */}
          {!isError && !isComplete && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress.progress)}%</Text>
            </View>
          )}

          {/* Stage Indicator */}
          <Text style={styles.stageText}>
            {isError
              ? 'Upload failed'
              : isComplete
              ? 'Upload complete'
              : progress.stage === 'processing'
              ? 'Processing...'
              : progress.stage === 'uploading'
              ? 'Uploading...'
              : progress.stage === 'creating-post'
              ? 'Finalizing...'
              : 'Please wait...'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 30,
            elevation: 10,
          }),
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconBadge: {
      width: 80,
      height: 80,
      borderRadius: radius.round,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.accent,
    },
    iconBadgeError: {
      backgroundColor: colors.errorSoft,
      borderColor: colors.error,
    },
    iconBadgeSuccess: {
      backgroundColor: colors.successSoft,
      borderColor: colors.success,
    },
    message: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    progressBarContainer: {
      width: '100%',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.round,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: radius.round,
    },
    progressText: {
      ...typography.mono.caption,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '700',
    },
    stageText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
