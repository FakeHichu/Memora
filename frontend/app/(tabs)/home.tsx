import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase/client';
import { radius, spacing, typography, layout, shadows } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import {
  getLocalPhotoPosts,
  getTodayPost,
  getFavoritePosts,
  hasPostedToday,
  setPhotoDraft,
  getLocalProfile,
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
import { Avatar } from '@/components/ui/Avatar';
import { SearchBar } from '@/components/ui/SearchBar';
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
export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [favorites, setFavorites] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileName, setProfileName] = useState('Memory Keeper');
  const { open: openCommandPalette } = useCommandPalette();
  const todayPrompt = getTodayPrompt();
  React.useEffect(() => {
    let isActive = true;
    getLocalProfile()
      .then((profile) => {
        if (isActive) setProfileName(profile.name);
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, []);
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
  const featuredMemory = onThisDayMemories[0] || activePosts[0];
  const pinnedMemories = activePosts.filter((p) => p.isPinned);
  const streak = computeCurrentStreak(posts);
  const handleCaptureWithPrompt = () => {
    setPhotoDraft('', todayPrompt);
    router.push('/(tabs)/create');
  };
  const handleReact = async (postId: string, emoji: string) => {
    try {
      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;
      
      if (!userId) return;
      
      const response = await fetch(\`\${backendUrl}/api/reactions\`, {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${sessionData.session.access_token}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          reactionType: emoji,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to save reaction.');
        return;
      }
      
      const result = await response.json();
      
      // Update local state - find the post and update its reactions
      setPosts((prev =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: result.reactionsMap,
            userReaction: result.userReaction,
          };
        })
      ));
      
      setReactionsMap(result.reactionsMap);
      setUserReactions(result.userReactions);
    } catch (err) {
      setErrorMessage('Failed to save reaction.');
    }
  };
  const matchesSearch = (post: LocalPhotoPost): boolean => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const caption = (post.caption || '').toLowerCase();
    const title = (post.title || '').toLowerCase();
    const location = (post.location || '').toLowerCase();
    const tags = (post.tags || []).join(' ').toLowerCase();
    const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
    return (
      caption.includes(query) ||
      title.includes(query) ||
      location.includes(query) ||
      tags.includes(query) ||
      dateStr.includes(query)
    );
  };
  const filteredPosts = activePosts.filter((post) => {
    const matchesFilter = selectedFilter === 'All' || post.category === selectedFilter;
    return matchesFilter && matchesSearch(post);
  });
  const recentPosts = filteredPosts.filter((p) => !p.isPinned).slice(0, 8);
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <View pointerEvents="none" style={styles.ambientBackdrop}>
        <View style={[styles.ambientGlow, styles.ambientGlowPrimary]} />
        <View style={[styles.ambientGlow, styles.ambientGlowSecondary]} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern App Header matching reference Screen 1 */}
        <AppHeader
          greeting={getGreeting()}
          userName={profileName}
          title="Let's revisit your best memories!"
          avatar={<Avatar name={profileName} size={46} ring />}
          actions={[
            {
              icon: 'star',
              onPress: () => router.push('/favorites'),
              accessibilityLabel: 'Favorites',
            },
            {
              icon: 'cog',
              onPress: openCommandPalette,
              accessibilityLabel: 'Settings and commands',
            },
          ]}
        />
        {/* Pill Search Bar with Embedded Right Search Button */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search memories, places, people…"
            onClear={() => setSearchQuery('')}
          />
        </View>
        {/* Category Pill Filters */}
        <View style={styles.filterSection}>
          <FilterChips
            filters={HOME_FILTERS}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </View>
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
        {/* Most Popular / Featured Memory Hero Section (matching reference image Screen 1) */}
        {featuredMemory && (
          <View style={styles.heroSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Most popular memories</Text>
              <Pressable onPress={() => router.push('/favorites')}>
                <Text style={styles.sectionHeaderAction}>See all</Text>
              </Pressable>
            </View>
            <MemoryCard
              memory={featuredMemory}
              density="editorial"
              aspectRatio={16 / 11}
              onPress={() => router.push(`/post/${featuredMemory.id}`)}
              showMemoryId={true}
              showReactions={true}
              onReact={(emoji) => handleReact(featuredMemory.id, emoji)}
            />
          </View>
        )}
        {/* Daily Prompt Hero Card */}
        <View style={styles.promptHeroCard}>
          <View style={styles.promptHeader}>
            <View style={styles.promptTag}>
              <View style={[styles.promptDot, postedToday && styles.promptDotCompleted]} />
              <Text style={styles.promptTagText}>TODAY'S PROMPT</Text>
            </View>
            <Text style={styles.streakBadge}>
              {postedToday ? 'Today complete' : 'Your daily moment'}
            </Text>
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
            <SectionHeader title="Pinned" subtitle={`${pinnedMemories.length} pinned`} />
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
        {/* Recent Memories Feed */}
        <View style={styles.sectionBlock}>
          <SectionHeader
            title="Recent Memories"
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
          {isLoading ? (
            <View style={styles.memoriesFeed}>
              {[0, 1, 2].map((i) => (
                <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
              ))}
            </View>
          ) : recentPosts.length === 0 ? (
            <EmptyState
              title={
                selectedFilter === 'All' ? 'Start with one moment' : `No ${selectedFilter} memories`
              }
              message="Photos you take will appear here, organized by time and category."
              variant="camera"
              action={{
                label: 'Create a memory',
                onPress: () => router.push('/(tabs)/create'),
                variant: 'accent',
              }}
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.memoriesFeed}>
              {recentPosts.map((post) => (
                <MemoryCard
                  key={post.id}
                  memory={post}
                  density="editorial"
                  aspectRatio={4 / 5}
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
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    ambientBackdrop: {
      ...StyleSheet.absoluteFill,
      overflow: 'hidden',
    },
    ambientGlow: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: radius.round,
    },
    ambientGlowPrimary: {
      top: 90,
      right: -150,
      backgroundColor: colors.accentSoft,
    },
    ambientGlowSecondary: {
      top: 360,
      left: -180,
      width: 230,
      height: 230,
      backgroundColor: colors.accentSoft,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: 110,
    },
    searchContainer: {
      marginBottom: spacing.sm,
    },
    filterSection: {
      marginBottom: spacing.md,
    },
    heroSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionHeaderTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    sectionHeaderAction: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      paddingVertical: spacing.md,
      alignItems: 'center',
      ...(Platform.OS === 'web'
        ? ({ boxShadow: '0 4px 16px rgba(48, 36, 61, 0.05)' } as any)
        : shadows.sm),
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
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.borderSoft,
    },
    promptHeroCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({ boxShadow: '0 8px 24px rgba(48, 36, 61, 0.06)' } as any)
        : shadows.md),
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
      fontSize: 11,
      color: colors.accent,
      letterSpacing: 0.8,
      fontWeight: '800',
    },
    streakBadge: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      backgroundColor: colors.surfaceOverlay,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.round,
    },
    promptQuestion: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      lineHeight: 30,
      marginBottom: spacing.md,
    },
    promptSubtext: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: spacing.md,
      lineHeight: 18,
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
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    sectionBlock: {
      marginBottom: spacing.xl,
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
      height: 20,
    },
  });
}