import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { DoubleTapPhoto } from '@/components/ui/DoubleTapPhoto';
import { Icon } from '@/components/ui/Icons';
import type { LocalPhotoPost } from '@/lib/photo-draft';

interface CircleTimeCapsuleProps {
  memory?: LocalPhotoPost | null;
  circleName?: string;
  onReact?: (postId: string, reactionType: string) => void;
}

export function CircleTimeCapsule({
  memory,
  circleName = 'Class Circle',
  onReact,
}: CircleTimeCapsuleProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  if (!memory || !memory.uri) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header with Flashback badge */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Icon name="clock" size={13} color={colors.accent} />
            <Text style={styles.badgeTitle}>CLASS FLASHBACK</Text>
          </View>
          <Text style={styles.circleTag}>{circleName}</Text>
        </View>

        {/* Nostalgic Photo with Double-tap */}
        <View style={styles.photoContainer}>
          <DoubleTapPhoto
            uri={memory.uri}
            style={styles.photo}
            borderRadius={radius.lg}
            onSingleTap={() => router.push(`/post/${memory.id}`)}
            onDoubleTap={() => onReact?.(memory.id, 'heart')}
          />
        </View>

        {/* Caption & Author */}
        <View style={styles.footer}>
          <Text style={styles.caption} numberOfLines={2}>
            {memory.caption || 'A favorite shared memory from our class circle.'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.author}>Captured by {memory.authorName || 'Classmate'}</Text>
            <Pressable
              onPress={() => router.push(`/post/${memory.id}`)}
              hitSlop={8}
            >
              <Text style={styles.revisitText}>Revisit →</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: any, mode: 'light' | 'dark') {
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    badgeIcon: {
      fontSize: 14,
    },
    badgeTitle: {
      ...typography.sans.caption,
      fontWeight: '800',
      color: colors.accent,
      letterSpacing: 0.5,
      fontSize: 11,
    },
    circleTag: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      fontWeight: '500',
    },
    photoContainer: {
      width: '100%',
      height: 180,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface1,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    footer: {
      marginTop: spacing.sm,
    },
    caption: {
      ...typography.sans.subheadline,
      color: colors.textPrimary,
      fontWeight: '600',
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    author: {
      ...typography.sans.caption2,
      color: colors.textMuted,
    },
    revisitText: {
      ...typography.sans.caption,
      color: colors.accent,
      fontWeight: '700',
    },
  });
}
