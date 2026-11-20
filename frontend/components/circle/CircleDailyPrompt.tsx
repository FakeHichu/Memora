import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';

interface CircleDailyPromptProps {
  promptText?: string;
  circleName?: string;
  sharedCount?: number;
}

export function CircleDailyPrompt({
  promptText = 'Show your study spot or classroom vibe today',
  circleName = 'Cyber Security 2026',
  sharedCount = 3,
}: CircleDailyPromptProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={() => router.push('/(tabs)/create')}
        accessibilityRole="button"
        accessibilityLabel="Respond to class memory prompt"
      >
        <View style={styles.contentRow}>
          <View style={styles.textColumn}>
            <View style={styles.badgeRow}>
              <View style={styles.sparkDot} />
              <Text style={styles.badgeText}>CLASS DAILY PROMPT</Text>
            </View>
            <Text style={styles.promptTitle}>{promptText}</Text>
            <Text style={styles.promptSubtitle}>
              {sharedCount} classmates in {circleName.split(' ')[0]} shared today
            </Text>
          </View>

          <View style={styles.actionBtn}>
            <Icon name="camera" size={14} color={colors.crust} />
            <Text style={styles.actionBtnText}>Share</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function createStyles(colors: any, mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      padding: spacing.md,
      position: 'relative',
      overflow: 'hidden',
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 3,
          }),
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    textColumn: {
      flex: 1,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    sparkDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    badgeText: {
      ...typography.mono.micro,
      color: colors.accent,
      fontWeight: '800',
      letterSpacing: 0.5,
      fontSize: 10,
    },
    promptTitle: {
      ...typography.sans.subheadline,
      color: colors.textPrimary,
      fontWeight: '700',
      lineHeight: 18,
    },
    promptSubtitle: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      marginTop: 2,
    },
    actionBtn: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    actionBtnIcon: {
      fontSize: 14,
    },
    actionBtnText: {
      ...typography.sans.caption,
      fontWeight: '700',
      color: colors.crust,
    },
  });
}
