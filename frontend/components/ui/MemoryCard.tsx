import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';
import { radius, spacing, typography, shadows, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { LocalPhotoPost } from '@/lib/photo-draft';
import { ReactionBar } from './ReactionBar';
import { TagList } from './TagBadge';
import { Icon } from './Icons';
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
  showTags?: boolean;
  authorName?: string;
  isBlurred?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
};
export const MemoryCard = React.memo(function MemoryCard({
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
  showTags = true,
  authorName,
  isBlurred = false,
  isSelected = false,
  selectionMode = false,
}: MemoryCardProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
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
      aspectRatio: aspectRatio || 16 / 11,
      imageRadius: 24,
      padding: spacing.md,
      gap: spacing.sm,
      titleStyle: typography.sans.title3,
      captionStyle: typography.sans.body,
      metaStyle: typography.sans.caption,
      showCaption: true,
      showTime: true,
      showId: true,
    },
    compact: {
      aspectRatio: aspectRatio || 1,
      imageRadius: 16,
      padding: spacing.sm,
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
      imageRadius: 18,
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
  const totalReactions = Object.values(memory.reactions || {}).reduce((acc, count) => acc + count, 0);
  return (
    <Pressable
      onPress={selectionMode ? onLongPress : onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        density === 'editorial' && styles.editorialContainer,
        isInteractive && pressed && styles.pressed,
        isSelected && styles.selectedContainer,
        style,
      ]}
      accessibilityRole={isInteractive ? 'button' : 'image'}
      accessibilityLabel={
        selectionMode
          ? `${isSelected ? 'Deselect' : 'Select'} memory from ${formattedDate}`
          : memory.caption || `Memory from ${formattedDate}`
      }
      accessibilityState={{ selected: isSelected }}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <View style={styles.selectionIndicator}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      )}
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
        {/* Floating Top Left Pill Badge: Time / Duration (like 25 min in reference image) */}
        {!isBlurred && (
          <View style={styles.topLeftPill}>
            <Icon name="clock" size={13} color="#FFFFFF" />
            <Text style={styles.pillText}>{timeString || 'Recently'}</Text>
          </View>
        )}
        {/* Floating Top Right Pill Badge: Hearts / Favorites (like 385 in reference image) */}
        {!isBlurred && (
          <View style={styles.topRightPill}>
            <Icon
              name="heart"
              size={13}
              color={memory.isFavorite ? colors.highlight : '#FFFFFF'}
              fill={memory.isFavorite ? colors.highlight : undefined}
            />
            <Text style={styles.pillText}>
              {totalReactions > 0 ? totalReactions : memory.isFavorite ? 'Loved' : 'Fav'}
            </Text>
          </View>
        )}
        {/* Pinned indicator */}
        {memory.isPinned && !isBlurred && (
          <View style={styles.pinnedIndicator}>
            <Text style={styles.pinnedIcon}>📌</Text>
          </View>
        )}
        {/* Archive indicator */}
        {memory.isArchived && (
          <View style={styles.archivedBanner}>
            <Text style={styles.archivedText}>ARCHIVED</Text>
          </View>
        )}
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
        {/* Editorial Floating Bottom Card Overlay (like the Leek pasta title card in image 1) */}
        {density === 'editorial' && (
          <View style={styles.floatingBottomCard}>
            <View style={styles.floatingCardHeader}>
              <Text style={styles.floatingCardTitle} numberOfLines={1}>
                {memory.title || memory.caption || 'Captured Moment'}
              </Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ 4.9</Text>
              </View>
            </View>
            {memory.caption && memory.title && (
              <Text style={styles.floatingCardCaption} numberOfLines={1}>
                {memory.caption}
              </Text>
            )}
            {memory.location && (
              <View style={styles.locationPill}>
                <Text style={styles.locationText} numberOfLines={1}>
                  📍 {memory.location}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      {/* Non-editorial content layout */}
      {density !== 'editorial' &&
      (config.showCaption || showMetadata || showReactions || memory.prompt || showTags) ? (
        <View
          style={[
            styles.content,
            { gap: config.gap, paddingHorizontal: config.padding, paddingBottom: config.padding },
          ]}
        >
          {(showMemoryId || config.showId) && <Text style={styles.memoryId}>{memoryId}</Text>}
          {/* Title */}
          {memory.title && (
            <Text
              style={[config.titleStyle, styles.title, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {memory.title}
            </Text>
          )}
          {memory.prompt && (
            <View style={styles.promptBadge}>
              <Text style={styles.promptBadgeText} numberOfLines={1}>
                💬 {memory.prompt}
              </Text>
            </View>
          )}
          {memory.caption && config.showCaption && !memory.title && (
            <Text
              style={[config.captionStyle, styles.caption, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {memory.caption}
            </Text>
          )}
          {/* Tags */}
          {showTags && memory.tags && memory.tags.length > 0 && density !== 'compact' && (
            <TagList tags={memory.tags} maxVisible={3} />
          )}
          {showMetadata && (
            <View style={styles.metaRow}>
              <Text style={[config.metaStyle, styles.metaText]}>{formattedDate}</Text>
              {memory.category && memory.category !== 'General' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={[config.metaStyle, styles.metaDivider]}>·</Text>
                  <Text style={[config.metaStyle, styles.categoryBadge]}>{memory.category}</Text>
                </View>
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
      ) : null}
    </Pressable>
  );
});
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 24px rgba(0, 0, 0, 0.4)'
              : '0 6px 20px rgba(48, 36, 61, 0.06)',
          } as any)
        : shadows.sm),
    },
    editorialContainer: {
      borderRadius: 28,
      padding: 6,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.5)'
              : '0 12px 32px rgba(48, 36, 61, 0.08)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }),
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },
    selectedContainer: {
      borderWidth: 2,
      borderColor: colors.accent,
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
    topLeftPill: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(20, 14, 30, 0.72)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any)
        : {}),
    },
    topRightPill: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(20, 14, 30, 0.72)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any)
        : {}),
    },
    pillText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    floatingBottomCard: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      backgroundColor: isDark ? 'rgba(33, 22, 51, 0.92)' : 'rgba(255, 253, 248, 0.94)',
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 4,
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    floatingCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    floatingCardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
      letterSpacing: -0.2,
    },
    ratingBadge: {
      backgroundColor: colors.surfaceOverlay,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    ratingText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.highlight,
    },
    floatingCardCaption: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    locationPill: {
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    locationText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
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
      fontSize: 12,
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
      fontSize: 11,
      color: '#ffffff',
      fontWeight: '600',
    },
    pinnedIndicator: {
      position: 'absolute',
      top: 50,
      left: 14,
      backgroundColor: colors.card,
      borderRadius: 999,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinnedIcon: {
      fontSize: 13,
    },
    archivedBanner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(8, 8, 12, 0.75)',
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    archivedText: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1,
    },
    selectionIndicator: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      zIndex: 10,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: radius.round,
      borderWidth: borders.thin,
      borderColor: colors.chrome,
      backgroundColor: 'rgba(8, 8, 12, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    checkmark: {
      fontSize: 12,
      color: colors.textInverse,
      fontWeight: '700',
    },
    imageImmersive: {
      borderRadius: 0,
    },
    content: {
      flex: 1,
      paddingTop: spacing.sm,
    },
    memoryId: {
      fontSize: 10,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    title: {
      fontWeight: '700',
      letterSpacing: -0.2,
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
      fontSize: 11,
      color: colors.accent,
      fontWeight: '600',
    },
    caption: {
      color: colors.textSecondary,
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
}