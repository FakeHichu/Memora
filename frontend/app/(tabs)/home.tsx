import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  getTodayPost,
  hasPostedToday,
  setPhotoDraft,
  toggleLocalPhotoReaction,
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
      postDate.getFullYear() !== today.getFullYear()
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const todayPrompt = getTodayPrompt();

  const loadPosts = useCallback(() => {
    let isActive = true;

    getLocalPhotoPosts()
      .then((savedPosts) => {
        if (isActive) {
          setPosts(savedPosts);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setPosts([]);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadPosts);

  const postedToday = hasPostedToday(posts);
  const todayMemory = getTodayPost(posts);
  const onThisDayMemories = getOnThisDayMemories(posts);
  const featuredMemory = onThisDayMemories[0];

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

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'All') return true;
    return post.category === selectedFilter;
  });

  const recentPosts = filteredPosts.slice(0, 8);

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

          {postedToday && todayMemory ? (
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
                Take or upload exactly one photo today to keep your daily streak alive.
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
            posts.length > 0
              ? `${posts.length} ${posts.length === 1 ? 'memory' : 'memories'}`
              : undefined
          }
        />

        <FilterChips
          filters={HOME_FILTERS}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading your memories…</Text>
          </View>
        ) : recentPosts.length === 0 ? (
          <EmptyState
            title={
              selectedFilter === 'All' ? 'Start with one moment' : `No ${selectedFilter} memories`
            }
            message="Photos you take will appear here, organized by time and category."
            icon="camera"
            action={{
              label: 'Create a memory',
              onPress: () => router.push('/(tabs)/create'),
            }}
            style={styles.emptyState}
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
                onReact={(emoji) => handleReact(post.id, emoji)}
              />
            ))}
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
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bottomSpacer: {
    height: 40,
  },
});