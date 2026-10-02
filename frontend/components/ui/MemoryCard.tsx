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

type MemoryCardDensity = 'editorial' | 'compact' | 'immersive' | 'timeline';

type MemoryCardProps = {
  memory: LocalPhotoPost;
  density?: MemoryCardDensity;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  showMetadata?: boolean;
  aspectRatio?: number;
  showMemoryId?: boolean;
};

export function MemoryCard({
  memory,
  density = 'compact',
  onPress,
  onLongPress,
  style,
  showMetadata = true,
  aspectRatio,
  showMemoryId = false,
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

  // Memory ID from timestamp
  const memoryId = `MEMORY_${memory.id.slice(-3).padStart(3, '0')}`;

  const densityConfig = {
    editorial: {
      aspectRatio: aspectRatio || 4 / 5,
      imageRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      titleStyle: typography.serif.title3,
      captionStyle: typography.body,
      metaStyle: typography.caption,
      showCaption: true,
      showTime: true,
      showId: true,
    },
    compact: {
      aspectRatio: aspectRatio || 1,
      imageRadius: radius.lg,
      padding: 0,
      gap: spacing.xs,
      titleStyle: typography.callout,
      captionStyle: typography.subheadline,
      metaStyle: typography.caption2,
      showCaption: true,
      showTime: false,
      showId: false,
    },
    timeline: {
      aspectRatio: aspectRatio || 4 / 3,
      imageRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      titleStyle: typography.headline,
      captionStyle: typography.body,
      metaStyle: typography.footnote,
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
      metaStyle: typography.caption,
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
          ]}
          resizeMode="cover"
        />
        {/* Subtle chrome accent on top edge */}
        <View style={styles.chromeAccentTop} />
      </View>

      {(config.showCaption || showMetadata) && (
        <View
          style={[
            styles.content,
            { gap: config.gap, paddingHorizontal: config.padding, paddingBottom: config.padding },
          ]}
        >
          {(showMemoryId || config.showId) && <Text style={styles.memoryId}>{memoryId}</Text>}

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
            </View>
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
    borderColor: colors.borderChrome,
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
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
  },
  image: {
    width: '100%',
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
  },
  memoryId: {
    ...typography.mono.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
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
});
