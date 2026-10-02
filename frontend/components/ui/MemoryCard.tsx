import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
  shadows,
  webShadows,
  borders,
} from '@/constants/theme';
import { LocalPhotoPost } from '@/lib/photo-draft';
import { ReactionBar } from './ReactionBar';

type MemoryCardDensity = 'editorial' | 'compact' | 'immersive' | 'timeline';

type MemoryCardProps = {
  memory: LocalPhotoPost;
  density?: MemoryCardDensity;
  onPress?: () => void;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
  style?: ViewStyle;
  showMetadata?: boolean;
  aspectRatio?: number;
  showMemoryId?: boolean;
  showReactions?: boolean;
  authorName?: string;
  isBlurred?: boolean;
};

export function MemoryCard({
  memory,
  density = 'compact',
  onPress,
  onLongPress,
  onReact,
  style,
  showMetadata = true,
  aspectRatio,
  showMemoryId = false,
  showReactions = false,
  authorName,
  isBlurred = false,
}: MemoryCardProps) {
  const date = new Date(memory.createdAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
  const timeString = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const memoryId = `MEMORY_${memory.id.slice(-3).padStart(3, '0')}`;

  const densityConfig = {
    editorial: {
      aspectRatio: aspectRatio || 4 / 5,
      imageRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      titleStyle: typography.serif.title3,
      captionStyle: typography.sans.body,
      metaStyle: typography.sans.caption,
      showCaption: true,
      showTime: true,
      showId: true,
    },
    compact: {
      aspectRatio: aspectRatio || 1,
      imageRadius: radius.lg,
      padding: 0,
      gap: spacing.xs,
      titleStyle: typography.sans.callout,
      captionStyle: typography.sans.subheadline,
      metaStyle: typography.sans.caption2,
      showCaption: true,
      showTime: false,
      showId: false,
    },
    timeline: {
      aspectRatio: aspectRatio || 4 / 3,
      imageRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      titleStyle: typography.sans.headline,
      captionStyle: typography.sans.body,
      metaStyle: typography.sans.footnote,
      showCaption: true,
      showTime: true,
      showId: true,
    },
    immersive: {
      aspectRatio: aspectRatio || 3 / 4,
      imageRadius: 0,
      padding: 0,
      gap: spacing.lg,
      titleStyle: typography.serif.title,
      captionStyle: typography.serifItalic.body,
      metaStyle: typography.sans.caption,
      showCaption: true,
      showTime: true,
      showId: true,
    },
  }[density];

  const config = densityConfig;
  const isInteractive = onPress || onLongPress;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        config.padding === 0 ? styles.noPadding : {},
        isInteractive && pressed && styles.pressed,
        style,
      ]}
      accessibilityRole={isInteractive ? 'button' : 'image'}
      accessibilityLabel={memory.caption || `Memory from ${formattedDate}`}
    >
      <View style={[styles.imageWrapper, { borderRadius: config.imageRadius }]}>
        <Image
          source={{ uri: memory.uri }}
          style={[
            styles.image,
            {
              aspectRatio: config.aspectRatio,
              borderRadius: config.imageRadius,
            },
            density === 'immersive' && styles.imageImmersive,
            isBlurred && styles.blurredImage,
          ]}
          blurRadius={isBlurred ? 25 : 0}
          resizeMode="cover"
        />
        {/* Subtle chrome accent on top edge — Y2K hardware reference */}
        <View style={styles.chromeAccentTop} />

        {isBlurred && (
          <View style={styles.blurOverlay}>
            <Text style={styles.blurText}>🔒 Post today's photo to reveal</Text>
          </View>
        )}

        {authorName && (
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>{authorName}</Text>
          </View>
        )}
      </View>

      {(config.showCaption || showMetadata || showReactions || memory.prompt) && (
        <View
          style={[
            styles.content,
            { gap: config.gap, paddingHorizontal: config.padding, paddingBottom: config.padding },
          ]}
        >
          {(showMemoryId || config.showId) && <Text style={styles.memoryId}>{memoryId}</Text>}

          {memory.prompt && (
            <View style={styles.promptBadge}>
              <Text style={styles.promptBadgeText} numberOfLines={1}>
                💬 {memory.prompt}
              </Text>
            </View>
          )}

          {memory.caption && config.showCaption && (
            <Text
              style={[config.captionStyle, styles.caption, { color: colors.textPrimary }]}
              numberOfLines={density === 'editorial' ? 3 : 2}
            >
              {memory.caption}
            </Text>
          )}

          {showMetadata && (
            <View style={styles.metaRow}>
              <Text style={[config.metaStyle, styles.metaText]}>{formattedDate}</Text>
              {config.showTime && (
                <>
                  <Text style={[config.metaStyle, styles.metaDivider]}>·</Text>
                  <Text style={[config.metaStyle, styles.metaText]}>{timeString}</Text>
                </>
              )}
              {memory.category && memory.category !== 'General' && (
                <>
                  <Text style={[config.metaStyle, styles.metaDivider]}>·</Text>
                  <Text style={[config.metaStyle, styles.categoryBadge]}>{memory.category}</Text>
                </>
              )}
            </View>
          )}

          {showReactions && onReact && (
            <ReactionBar
              reactions={memory.reactions}
              userReaction={memory.userReaction}
              onReact={onReact}
              compact={density === 'compact'}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    ...(Platform.OS === 'web' ? webShadows.sm : shadows.sm),
  },
  noPadding: {
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  blurredImage: {
    opacity: 0.6,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 8, 12, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  blurText: {
    ...typography.sans.caption,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(8, 8, 12, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    textAlign: 'center',
  },
  authorBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(8, 8, 12, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  authorBadgeText: {
    ...typography.sans.caption2,
    color: '#ffffff',
    fontWeight: '600',
  },
  imageImmersive: {
    borderRadius: 0,
  },
  chromeAccentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: borders.hairline,
    backgroundColor: colors.chromeGlow,
  },
  content: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  memoryId: {
    ...typography.mono.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  promptBadge: {
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  promptBadgeText: {
    ...typography.sans.caption2,
    color: colors.accent,
    fontWeight: '600',
  },
  caption: {
    lineHeight: undefined,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  metaText: {
    color: colors.textMuted,
  },
  metaDivider: {
    color: colors.textMuted,
    opacity: 0.5,
  },
  categoryBadge: {
    color: colors.accent,
    fontWeight: '600',
  },
});