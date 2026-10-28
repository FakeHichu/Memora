import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, layout } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';

const MEMORY_FILTERS = ['All', 'People', 'Places', 'Events'];

type MemorySection = {
  key: string;
  title: string;
  data: LocalPhotoPost[];
};

export default function MemoriesScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  // Group posts by month with fixed filter & search logic
  const sections: MemorySection[] = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (post.isArchived) return false;
      if (selectedFilter !== 'All' && post.category !== selectedFilter) return false;
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
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
    });

    const groups: Record<string, LocalPhotoPost[]> = {};
    for (const post of filtered) {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [year, month] = key.split('-').map(Number);
        const monthTitle = new Date(year, month).toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        });
        return { key, title: monthTitle, data: items };
      });
  }, [posts, selectedFilter, searchQuery]);

  const handleSearchToggle = () => {
    setShowSearch((prev) => !prev);
  };

  const totalVisibleMemories = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            <AppHeader
              title="Memories"
              subtitle={
                posts.length > 0
                  ? `${totalVisibleMemories} ${totalVisibleMemories === 1 ? 'memory' : 'memories'}`
                  : undefined
              }
              rightAction={{
                icon: showSearch ? 'close' : 'search',
                onPress: handleSearchToggle,
                accessibilityLabel: showSearch ? 'Close search' : 'Search memories',
              }}
            />

            {showSearch && (
              <View style={styles.searchContainer}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search your memories…"
                  autoFocus={true}
                  onClear={() => setSearchQuery('')}
                />
              </View>
            )}

            <FilterChips
              filters={MEMORY_FILTERS}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </>
        }
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeaderContainer}>
            <SectionHeader
              title={title}
              subtitle={`${data.length} ${data.length === 1 ? 'memory' : 'memories'}`}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <MemoryCard
              memory={item}
              density="timeline"
              aspectRatio={4 / 3}
              onPress={() => router.push(`/post/${item.id}`)}
              showMemoryId={true}
              showReactions={true}
              showTags={true}
            />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingFeed}>
              {[0, 1, 2].map((i) => (
                <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
              ))}
            </View>
          ) : (
            <EmptyState
              title={searchQuery ? 'No memories found' : 'Your memories will live here'}
              message={
                searchQuery
                  ? `No memories match "${searchQuery}". Try a different search.`
                  : 'Take a photo from Create to start your collection.'
              }
              variant={searchQuery ? 'search' : 'camera'}
              action={
                !searchQuery
                  ? {
                      label: 'Create a memory',
                      onPress: () => router.push('/(tabs)/create'),
                      variant: 'accent',
                    }
                  : undefined
              }
              style={styles.emptyState}
            />
          )
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeaderContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingFeed: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  bottomSpacer: {
    height: spacing.huge,
  },
});
