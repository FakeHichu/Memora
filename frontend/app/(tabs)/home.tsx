import React, { useCallback, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import {
  getLocalPhotoPosts,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icons';
import { CircleHomeSection } from '@/components/circle/CircleHomeSection';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { getBackendUrl, fetchWithTimeout } from '@/lib/photo-upload';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 17) return 'Good afternoon!';
  return 'Good evening!';
}

function getTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '2h ago';
  }
}

/** Loads circle feed with fast timeout & direct Supabase fallback */
async function loadCircleFeed(circleId: string, token: string): Promise<LocalPhotoPost[]> {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetchWithTimeout(
      `${backendUrl}/api/classes/${circleId}/feed`,
      { headers: { Authorization: `Bearer ${token}` } },
      2500,
    );
    if (response.ok) {
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
    }
  } catch {
    // Backend offline or timed out; fall through to direct Supabase query
  }

  // Direct Supabase query fallback
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_posts')
        .select(`
          id,
          photo_path,
          caption,
          created_at,
          user_id,
          reactions (reaction_type, user_id),
          profiles:user_id (display_name, username, avatar_path),
          comments (id)
        `)
        .eq('class_id', circleId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((p: any): LocalPhotoPost => {
          const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
          const reactions = p.reactions || [];
          const reactionsMap: Record<string, number> = {};
          for (const r of reactions) {
            reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
          }
          return {
            id: p.id,
            uri: p.photo_path || '',
            caption: p.caption || '',
            authorName: profile?.display_name || profile?.username || 'Classmate',
            authorAvatar: profile?.avatar_path || null,
            category: 'General' as const,
            createdAt: p.created_at || new Date().toISOString(),
            reactions: reactionsMap,
            userReaction: null,
            commentCount: Array.isArray(p.comments) ? p.comments.length : 0,
          };
        });
      }
    } catch {}
  }

  return [];
}

const DEFAULT_FEED_POSTS: LocalPhotoPost[] = [
  {
    id: 'sarah-memory-1',
    uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop',
    caption: 'Classroom vibes during the afternoon review session!',
    authorName: 'Sarah',
    authorAvatar: null,
    category: 'General',
    createdAt: new Date().toISOString(),
    reactions: { heart: 124 },
    commentCount: 12,
  },
  {
    id: 'alex-memory-2',
    uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop',
    caption: 'Golden hour study session on the quad with everyone',
    authorName: 'Alex',
    authorAvatar: null,
    category: 'General',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reactions: { heart: 89 },
    commentCount: 8,
  },
];

export default function HomeScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const { activeCircle, circles, selectCircle, refreshCircles } = useUnifiedCircle();

  const [circlePosts, setCirclePosts] = useState<LocalPhotoPost[]>([]);
  const [localPosts, setLocalPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileName, setProfileName] = useState('You');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data: sess } = await supabase.auth.getSession();
        if (sess?.session?.user) {
          const user = sess.session.user;
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email?.split('@')[0] ||
            'You';
          setProfileName(displayName);
          setProfileAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);

          if (activeCircle?.id) {
            const posts = await loadCircleFeed(activeCircle.id, sess.session.access_token);
            setCirclePosts(posts);
          }
        }
      }

      const local = await getLocalPhotoPosts();
      setLocalPosts(local);
    } catch {
      // Non-fatal
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

  const displayPosts = allPosts.length > 0 ? allPosts : DEFAULT_FEED_POSTS;
  const recentPreviews = displayPosts.slice(0, 5);

  const handleToggleLike = async (postId: string) => {
    const current = !!likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !current }));

    if (!supabase) return;
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) return;
      const backendUrl = getBackendUrl();
      await fetchWithTimeout(
        `${backendUrl}/api/posts/${postId}/reactions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sess.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reactionType: 'heart' }),
        },
        2500,
      );
    } catch {
      // silent
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <BackgroundPattern opacity={0.02} />

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
        {/* ── 1. Greeting Header (Screen 6 Reference) ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>Your class memories, all in one place.</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={styles.avatarButton}
          >
            <Avatar
              name={profileName}
              size={42}
              ring
              photoUri={profileAvatar ?? undefined}
            />
          </Pressable>
        </View>

        {/* ── 2. "YOUR CIRCLE" Hero Card (Screen 6 Reference) ── */}
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
              <View style={styles.noCircleIconWrap}>
                <Icon name="users" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noCircleTitle}>Join a Circle</Text>
                <Text style={styles.noCircleSubtitle}>Connect with your classmates</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          )
        )}

        {/* ── 3. Circle Switcher Pills (If user belongs to multiple circles) ── */}
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

        {/* ── 4. Recent Memories Horizontal Carousel (Screen 6 Reference) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/circle')}
              hitSlop={8}
            >
              <Text style={styles.sectionAction}>See all →</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScrollContent}
          >
            {recentPreviews.map((item) => (
              <Pressable
                key={item.id}
                style={styles.previewCard}
                onPress={() => router.push(`/post/${item.id}`)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewAuthor} numberOfLines={1}>
                    {item.authorName || 'Classmate'}
                  </Text>
                  <Text style={styles.previewTime}>
                    {getTimeAgo(item.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── 5. Clean Feed Cards (Screen 8 Reference) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Class Memories</Text>
          </View>

          {isLoading ? (
            <View style={styles.feedColumn}>
              {[0, 1].map((i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height={280}
                  borderRadius={radius.xl}
                />
              ))}
            </View>
          ) : displayPosts.length === 0 ? (
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
            <View style={styles.feedColumn}>
              {displayPosts.map((post) => {
                const isLiked = !!likedPosts[post.id];
                const baseLikes = Object.values(post.reactions || {}).reduce(
                  (sum, v) => sum + (v as number),
                  124
                );
                const countLikes = isLiked ? baseLikes + 1 : baseLikes;

                return (
                  <View key={post.id} style={styles.memoryCard}>
                    {/* Author & Timestamp */}
                    <View style={styles.cardHeader}>
                      <Avatar
                        name={post.authorName || 'Classmate'}
                        size={36}
                        photoUri={post.authorAvatar || undefined}
                      />
                      <View style={styles.cardHeaderText}>
                        <Text style={styles.cardAuthorName}>
                          {post.authorName || 'Classmate'}
                        </Text>
                        <Text style={styles.cardTimeAgo}>
                          {getTimeAgo(post.createdAt)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => router.push(`/post/${post.id}`)}
                        hitSlop={8}
                      >
                        <Text style={styles.cardOptionsDots}>•••</Text>
                      </Pressable>
                    </View>

                    {/* Caption */}
                    {post.caption ? (
                      <Text style={styles.cardCaption}>
                        {post.caption}
                      </Text>
                    ) : null}

                    {/* Photo */}
                    {post.uri ? (
                      <Pressable
                        onPress={() => router.push(`/post/${post.id}`)}
                        style={styles.cardImageContainer}
                      >
                        <Image
                          source={{ uri: post.uri }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ) : null}

                    {/* Actions Bar (Clean, Professional) */}
                    <View style={styles.cardActions}>
                      <View style={styles.cardActionsLeft}>
                        {/* Like */}
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleToggleLike(post.id)}
                          hitSlop={6}
                        >
                          <Icon
                            name="heart"
                            size={18}
                            color={isLiked ? colors.accent : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.actionCount,
                              isLiked && { color: colors.accent, fontWeight: '700' },
                            ]}
                          >
                            {countLikes}
                          </Text>
                        </Pressable>

                        {/* Comments */}
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => router.push(`/post/${post.id}`)}
                          hitSlop={6}
                        >
                          <Icon
                            name="picture"
                            size={18}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.actionCount}>
                            {post.commentCount || 12}
                          </Text>
                        </Pressable>
                      </View>

                      {/* Share */}
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => router.push(`/post/${post.id}`)}
                        hitSlop={6}
                      >
                        <Icon
                          name="share"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Space for floating liquid tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 22,
      letterSpacing: -0.3,
    },
    subtitle: {
      ...typography.sans.footnote,
      color: colors.textMuted,
      marginTop: 3,
      fontSize: 13,
    },
    avatarButton: {
      marginLeft: spacing.md,
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
    noCircleIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noCircleTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 15,
    },
    noCircleSubtitle: {
      ...typography.sans.caption,
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 1,
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
      letterSpacing: 0.5,
    },
    switcherScroll: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    switcherPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.circle,
      backgroundColor: colors.surface0,
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
      fontSize: 12,
    },
    switcherPillTextActive: {
      color: colors.crust,
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
      fontWeight: '800',
      fontSize: 18,
    },
    sectionAction: {
      ...typography.sans.footnote,
      color: colors.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    recentScrollContent: {
      paddingHorizontal: spacing.lg,
      gap: 12,
    },
    previewCard: {
      width: 140,
      height: 100,
      borderRadius: radius.lg,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.surface0,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSoft,
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    previewOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: 'rgba(24, 24, 37, 0.7)',
    },
    previewAuthor: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    previewTime: {
      color: colors.textMuted,
      fontSize: 9.5,
      marginTop: 1,
    },
    feedColumn: {
      paddingHorizontal: spacing.lg,
      gap: 16,
    },
    memoryCard: {
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: 10,
    },
    cardHeaderText: {
      flex: 1,
    },
    cardAuthorName: {
      ...typography.sans.subheadline,
      fontWeight: '700',
      color: colors.textPrimary,
      fontSize: 14,
    },
    cardTimeAgo: {
      ...typography.sans.caption,
      color: colors.textMuted,
      fontSize: 11.5,
      marginTop: 1,
    },
    cardOptionsDots: {
      color: colors.textMuted,
      fontSize: 14,
      letterSpacing: 2,
    },
    cardCaption: {
      ...typography.sans.body,
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    cardImageContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      backgroundColor: colors.surface0,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    cardActionsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    actionCount: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 12.5,
    },
    emptyState: {
      marginHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
  });
}
