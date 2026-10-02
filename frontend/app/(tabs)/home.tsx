import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

const HOME_FILTERS = ['All', 'People', 'Places', 'Events'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  const onThisDayMemories = getOnThisDayMemories(posts);
  const featuredMemory = onThisDayMemories[0];

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'All') return true;
    return true;
  });

  const recentPosts = filteredPosts.slice(0, 6);

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
            title="Start with one moment"
            message="Photos you take will appear here, organized by time and place."
            icon="camera"
            action={{
              label: 'Create a memory',
              onPress: () => router.push('/(tabs)/create'),
            }}
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.memoryGrid}>
            {recentPosts.map((post, index) => (
              <MemoryCard
                key={post.id}
                memory={post}
                density={index === 0 ? 'editorial' : 'compact'}
                aspectRatio={index === 0 ? 4 / 5 : 1}
                onPress={() => router.push(`/post/${post.id}`)}
                showMemoryId={index === 0}
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
  onThisDaySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.borderChrome,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 4,
      },
    }),
  },
  onThisDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSoft,
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
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
  onThisDayYearsAgo: {
    ...typography.serif.caption,
    color: colors.textMuted,
  },
  memoryGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bottomSpacer: {
    height: spacing.huge,
  },
});
