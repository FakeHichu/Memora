import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase/client';
import { radius, spacing, typography, layout, shadows, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import {
  getLocalPhotoPosts,
  getFavoritePosts,
  hasPostedToday,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard, Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { CircleHomeSection } from '@/components/circle/CircleHomeSection';
import { getBackendUrl } from '@/lib/photo-upload';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning! ☀️';
  if (hour < 17) return 'Good afternoon! 👋';
  return 'Good evening! 🌙';
}

/** Loads circle feed from the CORRECT endpoint: /api/classes/:id/feed */
async function loadCircleFeed(circleId: string, token: string): Promise<LocalPhotoPost[]> {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/classes/${circleId}/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.posts || []).map((p: any): LocalPhotoPost => ({
      id: p.id,
      uri: p.photoUrl || p.photo_path || '',
      caption: p.caption || '',
      authorName: p.authorName || 'Classmate',
      authorAvatar: p.authorAvatar || null,
      category: 'General' as const,
      createdAt: p.created_at || new Date().toISOString(),
      reactions: p.reactionsMap || {},
      userReaction: p.userReaction ?? null,
      commentCount: Array.isArray(p.comments) ? p.comments.length : (p.comment_count ?? 0),
    }));
  } catch {
    return [];
  }
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { activeCircle, circles, selectCircle, refreshCircles } = useUnifiedCircle();

  const [circlePosts, setCirclePosts] = useState<LocalPhotoPost[]>([]);
  const [localPosts, setLocalPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileName, setProfileName] = useState('Memory Keeper');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Load profile name from Supabase
      if (supabase) {
        const { data: sess } = await supabase.auth.getSession();
        if (sess?.session?.user) {
          const user = sess.session.user;
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email?.split('@')[0] ||
            'Memory Keeper';
          setProfileName(displayName);
          setProfileAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);

          // Load circle feed from CORRECT endpoint (classes, not circles)
          if (activeCircle?.id) {
            const posts = await loadCircleFeed(activeCircle.id, sess.session.access_token);
            setCirclePosts(posts);
          }
        }
      }

      // Always load local posts too
      const local = await getLocalPhotoPosts();
      setLocalPosts(local);
    } catch (err) {
      setErrorMessage('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  }, [activeCircle?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshCircles();
    }, [loadData, refreshCircles]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCircles();
    await loadData();
    setIsRefreshing(false);
  };

  // Merge deduplicated posts (circle posts take precedence)
  const allPostsMap = new Map<string, LocalPhotoPost>();
  localPosts.filter((p) => !p.isArchived).forEach((p) => allPostsMap.set(p.id, p));
  circlePosts.forEach((p) => allPostsMap.set(p.id, p));
  const allPosts = Array.from(allPostsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const recentPosts = allPosts.slice(0, 6);
  const postedToday = hasPostedToday(localPosts);

  const handleReact = async (postId: string, reactionType: string) => {
    if (!supabase) return;
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) return;
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sess.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      });
      if (res.ok) {
        const result = await res.json();
        setCirclePosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, reactions: result.reactionsMap || p.reactions, userReaction: result.userReaction }
              : p,
          ),
        );
      }
    } catch {
      // silent
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern opacity={0.025} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>Your class memories, all in one place.</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Avatar name={profileName} size={42} ring photoUri={profileAvatar ?? undefined} />
          </Pressable>
        </View>

        {/* ── Active Circle Card ── */}
        {activeCircle ? (
          <CircleHomeSection
            circle={activeCircle}
            onShareMemory={() => router.push('/(tabs)/circle')}
          />
        ) : (
          !isLoading && (
            <Pressable
              style={styles.noCircleCard}
              onPress={() => router.push('/(onboarding)/join-class')}
              accessibilityRole="button"
            >
              <Icon name="users" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noCircleTitle}>Join a Circle</Text>
                <Text style={styles.noCircleSubtitle}>Connect with your classmates</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          )
        )}

        {/* ── Circle Switcher ── */}
        {circles.length > 1 && (
          <View style={styles.switcherSection}>
            <Text style={styles.switcherLabel}>SWITCH CIRCLE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.switcherScroll}
            >
              {circles.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => selectCircle(c.id)}
                  style={[
                    styles.switcherPill,
                    c.id === activeCircle?.id && styles.switcherPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.switcherPillText,
                      c.id === activeCircle?.id && styles.switcherPillTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recent Memories ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            <Pressable onPress={() => router.push('/(tabs)/memories')}>
              <Text style={styles.sectionAction}>See all →</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.feedGrid}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={200} borderRadius={radius.xl} />
              ))}
            </View>
          ) : recentPosts.length === 0 ? (
            <EmptyState
              title="No Memories Yet!"
              message="Start sharing photos with your circle."
              variant="camera"
              action={{
                label: 'Upload Memory',
                onPress: () => router.push('/(tabs)/create'),
                variant: 'accent',
              }}
              style={styles.emptyState}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentStrip}
            >
              {recentPosts.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() => router.push(`/post/${post.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open memory${post.caption ? `: ${post.caption}` : ''}`}
                  style={styles.recentMemoryCard}
                >
                  {post.uri ? (
                    <Image source={{ uri: post.uri }} style={styles.recentMemoryImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.recentMemoryPlaceholder} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline memory card for home feed ──────────────────────────────────────
interface MemoryFeedCardProps {
  post: LocalPhotoPost;
  colors: ReturnType<typeof useAppTheme>['colors'];
  onPress: () => void;
  onReact: (emoji: string) => void;
}

function MemoryFeedCard({ post, colors, onPress, onReact }: MemoryFeedCardProps) {
  const timeAgo = getTimeAgo(post.createdAt);
  const totalReactions = Object.values(post.reactions || {}).reduce((s, v) => s + (v as number), 0);

  return (
    <Pressable
      onPress={onPress}
      style={[styles2.card, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}
      accessibilityRole="button"
    >
      {/* Author row */}
      <View style={styles2.authorRow}>
        <Avatar name={post.authorName || 'Classmate'} size={32} />
        <View style={{ flex: 1 }}>
          <Text style={[styles2.authorName, { color: colors.textPrimary }]}>
            {post.authorName || 'Classmate'}
          </Text>
          <Text style={[styles2.timeAgo, { color: colors.textMuted }]}>{timeAgo}</Text>
        </View>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="More options"
        >
          <Text style={{ color: colors.textMuted, fontSize: 18, lineHeight: 18 }}>⋯</Text>
        </Pressable>
      </View>

      {/* Caption */}
      {post.caption ? (
        <Text style={[styles2.caption, { color: colors.textPrimary }]} numberOfLines={2}>
          {post.caption}
        </Text>
      ) : null}

      {/* Photo */}
      {post.uri ? (
        <View style={styles2.imageWrapper}>
          <Image source={{ uri: post.uri }} style={styles2.image} resizeMode="cover" />
        </View>
      ) : null}

      {/* Reaction / comment row */}
      <View style={styles2.actionsRow}>
        <View style={styles2.reactionsGroup}>
          {['❤️', '😂', '🔥'].map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => onReact(emoji === '❤️' ? 'heart' : emoji === '😂' ? 'laugh' : 'fire')}
              style={styles2.reactionBtn}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={{ fontSize: 18 }}>{emoji}</Text>
            </Pressable>
          ))}
          {totalReactions > 0 && (
            <Text style={[styles2.reactionCount, { color: colors.textSecondary }]}>
              {totalReactions}
            </Text>
          )}
        </View>
        <View style={styles2.actionsRight}>
          <Pressable onPress={onPress} style={styles2.commentBtn}>
            <Text style={{ fontSize: 15 }}>💬</Text>
            {(post.commentCount ?? 0) > 0 && (
              <Text style={[styles2.reactionCount, { color: colors.textSecondary }]}>
                {post.commentCount}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles2.commentBtn}>
            <Text style={{ fontSize: 15 }}>🔗</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Icon component shim (Icon from ui/Icons may not support all names; use Text as fallback)
function Icon({ name, size, color }: { name: string; size: number; color: string }) {
  const map: Record<string, string> = {
    users: '👥',
    'chevron-right': '›',
    camera: '📷',
  };
  const icon = map[name] ?? '•';
  if (name === 'chevron-right') {
    return <Text style={{ fontSize: size, color, lineHeight: size + 2, fontWeight: '600' }}>{icon}</Text>;
  }
  return <Text style={{ fontSize: size - 2, lineHeight: size + 2 }}>{icon}</Text>;
}

const styles2 = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: borders.thin,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 10px rgba(0,0,0,0.10)' }
      : shadows.sm),
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 1,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reactionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reactionBtn: {
    padding: 2,
  },
  reactionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: 110,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    subtitle: {
      ...typography.sans.footnote,
      color: colors.textMuted,
      marginTop: 2,
    },
    noCircleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: borders.thin,
      borderColor: colors.accent,
    },
    noCircleTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    noCircleSubtitle: {
      ...typography.sans.caption,
      color: colors.textMuted,
    },
    switcherSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    switcherLabel: {
      ...typography.mono.micro,
      color: colors.textMuted,
      marginBottom: spacing.xs,
      fontSize: 9,
    },
    switcherScroll: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    switcherPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      backgroundColor: colors.surface,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
    },
    switcherPillActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    switcherPillText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    switcherPillTextActive: {
      color: colors.textInverse,
      fontWeight: '700',
    },
    sectionBlock: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 18,
    },
    sectionAction: {
      ...typography.sans.footnote,
      color: colors.accent,
      fontWeight: '700',
    },
    feedGrid: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    recentStrip: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    recentMemoryCard: {
      width: 240,
      height: 112,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surfaceElevated,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
    },
    recentMemoryImage: {
      width: '100%',
      height: '100%',
    },
    recentMemoryPlaceholder: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
    },
    emptyState: {
      marginHorizontal: spacing.lg,
      paddingVertical: spacing.xxl,
    },
    errorText: {
      ...typography.sans.footnote,
      color: colors.error,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });
}
