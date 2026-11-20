import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icons';
import { DoubleTapPhoto } from '@/components/ui/DoubleTapPhoto';
import type { LocalPhotoPost } from '@/lib/photo-draft';

interface HomeFeedCardProps {
  post: LocalPhotoPost;
  circleName?: string;
  onReact?: (postId: string, reactionType: string) => void;
}

export function HomeFeedCard({
  post,
  circleName = 'Cyber Security 2026',
  onReact,
}: HomeFeedCardProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const baseLikes = Object.values(post.reactions || {}).reduce(
    (sum, val) => sum + (val as number),
    124
  );
  const currentLikes = isLiked ? baseLikes + 1 : baseLikes;

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    onReact?.(post.id, 'heart');
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
    }
    onReact?.(post.id, 'heart');
  };

  const timeAgo = getTimeAgo(post.createdAt);
  const authorName = post.authorName || 'Classmate';

  return (
    <View style={styles.postContainer}>
      {/* ── 1. Instagram Post Header ── */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.authorGroup}
          onPress={() => router.push(`/post/${post.id}`)}
          hitSlop={8}
        >
          <View style={styles.avatarBorder}>
            <Avatar
              name={authorName}
              size={36}
              photoUri={post.authorAvatar || undefined}
            />
          </View>
          <View style={styles.headerTextGroup}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{authorName}</Text>
            </View>
            <Text style={styles.metaSubtitle} numberOfLines={1}>
              {circleName} • {timeAgo}
            </Text>
          </View>
        </Pressable>

        <Pressable
          hitSlop={12}
          onPress={() => router.push(`/post/${post.id}`)}
          style={styles.moreButton}
          accessibilityLabel="Post options"
        >
          <Text style={styles.moreDotsText}>•••</Text>
        </Pressable>
      </View>

      {/* ── 2. Immersive Photo with Double-Tap Heart Burst ── */}
      {post.uri ? (
        <View style={styles.mediaContainer}>
          <DoubleTapPhoto
            uri={post.uri}
            style={styles.photo}
            borderRadius={radius.sm}
            onSingleTap={() => router.push(`/post/${post.id}`)}
            onDoubleTap={handleDoubleTap}
          />
        </View>
      ) : null}

      {/* ── 3. Instagram Action Bar (Heart, Comment, Share ... Bookmark) ── */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <Pressable
            style={styles.iconHit}
            onPress={handleToggleLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Like"
          >
            <Icon
              name="heart"
              size={24}
              color={isLiked ? colors.accent : colors.textPrimary}
              fill={isLiked ? colors.accent : 'none'}
            />
          </Pressable>

          <Pressable
            style={styles.iconHit}
            onPress={() => router.push(`/post/${post.id}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Comments"
          >
            <Icon name="picture" size={23} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            style={styles.iconHit}
            onPress={() => router.push(`/post/${post.id}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Icon name="share" size={21} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          style={styles.iconHit}
          onPress={() => setIsSaved(!isSaved)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Save memory"
        >
          <Icon
            name="bookmark"
            size={22}
            color={isSaved ? colors.accent : colors.textPrimary}
            fill={isSaved ? colors.accent : 'none'}
          />
        </Pressable>
      </View>

      {/* ── 4. Likes Count ── */}
      <View style={styles.contentPadding}>
        <Text style={styles.likesText}>
          {currentLikes.toLocaleString()} likes
        </Text>

        {/* ── 5. Instagram Caption (Bold Username + Text) ── */}
        {post.caption ? (
          <Text style={styles.captionLine}>
            <Text
              style={styles.captionAuthor}
              onPress={() => router.push(`/post/${post.id}`)}
            >
              {authorName}{' '}
            </Text>
            <Text style={styles.captionBody}>{post.caption}</Text>
          </Text>
        ) : null}

        {/* ── 6. Comments Link ── */}
        <Pressable
          onPress={() => router.push(`/post/${post.id}`)}
          hitSlop={6}
          style={styles.commentsLinkWrapper}
        >
          <Text style={styles.viewCommentsText}>
            View all {post.commentCount || 12} comments
          </Text>
        </Pressable>

        {/* ── 7. Timestamp (e.g. 2 HOURS AGO) ── */}
        <Text style={styles.timestampText}>
          {timeAgo.toUpperCase()} AGO
        </Text>
      </View>
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  } catch {
    return '2h';
  }
}

function createStyles(colors: any, mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    postContainer: {
      marginBottom: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSoft,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    authorGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarBorder: {
      padding: 1,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    headerTextGroup: {
      marginLeft: spacing.sm,
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    authorName: {
      ...typography.sans.subheadline,
      fontWeight: '700',
      color: colors.textPrimary,
      fontSize: 13.5,
    },
    metaSubtitle: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 1,
    },
    moreButton: {
      padding: spacing.xs,
    },
    moreDotsText: {
      color: colors.textMuted,
      fontSize: 14,
      letterSpacing: 2,
    },
    mediaContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.surface0,
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconHit: {
      padding: 2,
    },
    contentPadding: {
      paddingHorizontal: spacing.md,
      paddingTop: 2,
    },
    likesText: {
      ...typography.sans.subheadline,
      fontWeight: '700',
      color: colors.textPrimary,
      fontSize: 13,
      marginBottom: 3,
    },
    captionLine: {
      ...typography.sans.body,
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 4,
    },
    captionAuthor: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    captionBody: {
      color: colors.textSecondary,
    },
    commentsLinkWrapper: {
      marginTop: 2,
      marginBottom: 3,
    },
    viewCommentsText: {
      ...typography.sans.caption,
      color: colors.textMuted,
      fontSize: 12.5,
    },
    timestampText: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      fontSize: 9.5,
      letterSpacing: 0.5,
      marginTop: 2,
    },
  });
}
