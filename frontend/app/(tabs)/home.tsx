import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  getTodayPost,
  hasPostedToday,
  setPhotoDraft,
  toggleLocalPhotoReaction,
  getFavoritePosts,
  computeCurrentStreak,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { defaultPrompts } from '@/constants/prompts';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard, Skeleton } from '@/components/ui/Skeleton';
import { useCommandPalette } from '@/components/ui/CommandPalette';

const HOME_FILTERS = ['All', 'People', 'Places', 'Events'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return defaultPrompts[dayOfYear % defaultPrompts.length];
}

function getOnThisDayMemories(posts: LocalPhotoPost[]): LocalPhotoPost[] {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();

  return posts.filter((post) => {
    const postDate = new Date(post.createdAt);
    return (
      postDate.getMonth() === month &&
      postDate.getDate() === day &&
      postDate.getFullYear() !== today.getFullYear() &&
      !post.isArchived
    );
  });
}

function getYearsAgoText(postDate: Date): string {
  const yearsAgo = new Date().getFullYear() - postDate.getFullYear();
  if (yearsAgo === 1) return '1 year ago';
  return `${yearsAgo} years ago`;
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [favorites, setFavorites] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { open: openCommandPalette } = useCommandPalette();

  const todayPrompt = getTodayPrompt();

  const loadPosts = useCallback(() => {
    let isActive = true;
    setIsLoading(true);

    Promise.all([getLocalPhotoPosts(), getFavoritePosts()])
      .then(([savedPosts, favPosts]) => {
        if (isActive) {
          setPosts(savedPosts);
          setFavorites(favPosts);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setPosts([]);
          setFavorites([]);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadPosts);

  const activePosts = posts.filter((p) => !p.isArchived);
  const postedToday = hasPostedToday(activePosts);
  const todayMemory = getTodayPost(activePosts);
  const onThisDayMemories = getOnThisDayMemories(posts);
  const featuredMemory = onThisDayMemories[0];
  const pinnedMemories = activePosts.filter((p) => p.isPinned);
  const streak = computeCurrentStreak(posts);

  const handleCaptureWithPrompt = () => {
    setPhotoDraft('', todayPrompt);
    router.push('/(tabs)/create');
  };

  const handleReact = async (postId: string, emoji: string) => {
    const updated = await toggleLocalPhotoReaction(postId, emoji);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  };

  const filteredPosts = activePosts.filter((post) => {
    if (selectedFilter === 'All') return true;
    return post.category === selectedFilter;
  });

  const recentPosts = filteredPosts
    .filter((p) => !p.isPinned)
    .slice(0, 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          greeting={getGreeting()}
          title="A little piece of your life"
          rightAction={{
            icon: 'search',
            onPress: () => router.push('/(tabs)/search'),
            accessibilityLabel: 'Search memories',
          }}
        />

        {/* Stats Row */}
        {!isLoading && activePosts.length > 0 && (
          <View style={styles.statsRow}>
            <Pressable
              style={styles.statItem}
              onPress={() => router.push('/(tabs)/memories')}
              accessibilityRole="button"
              accessibilityLabel={`${activePosts.length} total memories`}
            >
              <Text style={styles.statValue}>{activePosts.length}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable
              style={styles.statItem}
              onPress={() => router.push('/favorites')}
              accessibilityRole="button"
              accessibilityLabel={`${favorites.length} favorites`}
            >
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak > 0 ? `${streak}🔥` : '0'}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        )}
        {isLoading && (
          <View style={styles.statsRow}>
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Skeleton width={32} height={24} />
                  <Skeleton width={52} height={12} />
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/create')}
            accessibilityRole="button"
            accessibilityLabel="Create a memory"
          >
            <Text style={styles.quickActionIcon}>📸</Text>
            <Text style={styles.quickActionLabel}>New memory</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/favorites')}
            accessibilityRole="button"
            accessibilityLabel="View favorites"
          >
            <Text style={styles.quickActionIcon}>⭐</Text>
            <Text style={styles.quickActionLabel}>Favorites</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/collections')}
            accessibilityRole="button"
            accessibilityLabel="View collections"
          >
            <Text style={styles.quickActionIcon}>📁</Text>
            <Text style={styles.quickActionLabel}>Collections</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={openCommandPalette}
            accessibilityRole="button"
            accessibilityLabel="Open command palette"
          >
            <Text style={styles.quickActionIcon}>⌘</Text>
            <Text style={styles.quickActionLabel}>Commands</Text>
          </Pressable>
        </View>

        {/* Daily Prompt Hero Section */}
        <View style={styles.promptHeroCard}>
          <View style={styles.promptHeader}>
            <View style={styles.promptTag}>
              <View style={[styles.promptDot, postedToday && styles.promptDotCompleted]} />
              <Text style={styles.promptTagText}>TODAY'S PROMPT</Text>
            </View>
            <Text style={styles.streakBadge}>{postedToday ? '🔥 Posted Today' : '⏳ Pending'}</Text>
          </View>

          <Text style={styles.promptQuestion}>"{todayPrompt}"</Text>

          {isLoading ? (
            <View style={styles.promptActionWrapper}>
              <Skeleton width="100%" height={44} borderRadius={radius.round} />
            </View>
          ) : postedToday && todayMemory ? (
            <View style={styles.todayMemoryWrapper}>
              <Text style={styles.todayMemoryLabel}>YOUR MOMENT TODAY</Text>
              <MemoryCard
                memory={todayMemory}
                density="editorial"
                aspectRatio={16 / 9}
                onPress={() => router.push(`/post/${todayMemory.id}`)}
                showMetadata={true}
                showReactions={true}
                onReact={(emoji) => handleReact(todayMemory.id, emoji)}
              />
            </View>
          ) : (
            <View style={styles.promptActionWrapper}>
              <Text style={styles.promptSubtext}>
                Take or upload one photo today to keep your daily streak alive.
              </Text>
              <Button
                title="Capture Today's Photo"
                variant="accent"
                onPress={handleCaptureWithPrompt}
                style={styles.promptButton}
              />
            </View>
          )}
        </View>

        {/* Pinned Memories Section */}
        {pinnedMemories.length > 0 && (
          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Pinned"
              subtitle={`${pinnedMemories.length} pinned`}
            />
            <View style={styles.memoriesFeed}>
              {pinnedMemories.slice(0, 3).map((post) => (
                <MemoryCard
                  key={post.id}
                  memory={post}
                  density="timeline"
                  aspectRatio={4 / 3}
                  onPress={() => router.push(`/post/${post.id}`)}
                  showMemoryId={true}
                  showReactions={true}
                  onReact={(emoji) => handleReact(post.id, emoji)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Favorites Strip */}
        {favorites.length > 0 && (
          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Favorites"
              subtitle={`${favorites.length} memories`}
              action={{
                label: 'See all',
                onPress: () => router.push('/favorites'),
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesStrip}
            >
              {favorites.slice(0, 8).map((post) => (
                <Pressable
                  key={post.id}
                  style={styles.favoriteThumb}
                  onPress={() => router.push(`/post/${post.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Favorite memory from ${new Date(post.createdAt).toLocaleDateString()}`}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
                  <MemoryCard
                    memory={post}
                    density="compact"
                    aspectRatio={1}
                    onPress={() => router.push(`/post/${post.id}`)}
                    showMetadata={false}
                    showReactions={false}
                    showTags={false}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* On This Day Section */}
        {featuredMemory && (
          <View style={styles.onThisDaySection}>
            <View style={styles.onThisDayHeader}>
              <View style={styles.onThisDayLabel}>
                <View style={styles.onThisDayDot} />
                <Text style={styles.onThisDayLabelText}>ON THIS DAY</Text>
              </View>
              <Text style={styles.onThisDayYearsAgo}>
                {getYearsAgoText(new Date(featuredMemory.createdAt))}
              </Text>
            </View>

            <MemoryCard
              memory={featuredMemory}
              density="editorial"
              aspectRatio={4 / 5}
              onPress={() => router.push(`/post/${featuredMemory.id}`)}
              showMetadata={false}
              showMemoryId={true}
              showReactions={true}
              onReact={(emoji) => handleReact(featuredMemory.id, emoji)}
            />
          </View>
        )}

        {/* Your Memories Section */}
        <SectionHeader
          title="Your Memories"
          subtitle={
            activePosts.length > 0
              ? `${activePosts.length} ${activePosts.length === 1 ? 'memory' : 'memories'}`
              : undefined
          }
          action={
            activePosts.length > 6
              ? { label: 'See all', onPress: () => router.push('/(tabs)/memories') }
              : undefined
          }
        />

        <FilterChips
          filters={HOME_FILTERS}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {isLoading ? (
          <View style={styles.memoriesFeed}>
            {[0, 1, 2].map((i) => (
              <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
            ))}
          </View>
        ) : recentPosts.length === 0 ? (
          <EmptyState
            title={selectedFilter === 'All' ? 'Start with one moment' : `No ${selectedFilter} memories`}
            message="Photos you take will appear here, organized by time and category."
            variant="camera"
            action={{
              label: 'Create a memory',
              onPress: () => router.push('/(tabs)/create'),
              variant: 'accent',
            }}
            style={styles.emptyState}
            accessibilityLabel={selectedFilter === 'All' ? 'No memories yet. Create your first memory.' : `No ${selectedFilter} memories found.`}
          />
        ) : (
          <View style={styles.memoriesFeed}>
            {recentPosts.map((post) => (
              <MemoryCard
                key={post.id}
                memory={post}
                density="timeline"
                aspectRatio={4 / 3}
                onPress={() => router.push(`/post/${post.id}`)}
                showMemoryId={true}
                showReactions={true}
                showTags={true}
                onReact={(emoji) => handleReact(post.id, emoji)}
              />
            ))}
            {activePosts.length > 8 && (
              <Button
                title={`See all ${activePosts.length} memories`}
                variant="secondary"
                onPress={() => router.push('/(tabs)/memories')}
                fullWidth
              />
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingBottom: spacing.xxxl + layout.tabBarHeight,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
  },
  statValue: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: borders.hairline,
    height: 28,
    backgroundColor: colors.borderSubtle,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionLabel: {
    ...typography.sans.caption2,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  promptHeroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  promptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  promptDotCompleted: {
    backgroundColor: colors.success,
  },
  promptTagText: {
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  streakBadge: {
    ...typography.sans.caption2,
    color: colors.textSecondary,
    fontWeight: '600',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.round,
  },
  promptQuestion: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  promptSubtext: {
    ...typography.sans.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  promptActionWrapper: {
    paddingTop: spacing.xs,
  },
  promptButton: {
    width: '100%',
  },
  todayMemoryWrapper: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  todayMemoryLabel: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  sectionBlock: {
    marginBottom: spacing.xl,
  },
  favoritesStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  favoriteThumb: {
    width: 100,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  onThisDaySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  onThisDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  onThisDayLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  onThisDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  onThisDayLabelText: {
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  onThisDayYearsAgo: {
    ...typography.sans.caption,
    color: colors.textMuted,
  },
  memoriesFeed: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bottomSpacer: {
    height: 40,
  },
});
