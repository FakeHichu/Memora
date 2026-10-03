import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, layout } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

const MEMORY_FILTERS = ['All', 'People', 'Places', 'Events'];

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

  // Group posts by month
  const groupedPosts = React.useMemo(() => {
    const filtered = posts.filter((post) => {
      if (selectedFilter !== 'All') return true;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const caption = (post.caption || '').toLowerCase();
      const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
      return caption.includes(query) || dateStr.includes(query);
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
        return { key, title: monthTitle, items };
      });
  }, [posts, selectedFilter, searchQuery]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          title="Memories"
          subtitle={
            posts.length > 0
              ? `${posts.length} ${posts.length === 1 ? 'memory' : 'memories'}`
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

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading your memories…</Text>
          </View>
        ) : groupedPosts.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No memories found' : 'Your memories will live here'}
            message={
              searchQuery
                ? `No memories match "${searchQuery}". Try a different search.`
                : 'Take a photo from Create to start your collection.'
            }
            icon={searchQuery ? 'search' : 'camera'}
            action={
              !searchQuery
                ? {
                    label: 'Create a memory',
                    onPress: () => router.push('/(tabs)/create'),
                  }
                : undefined
            }
            style={styles.emptyState}
          />
        ) : (
          <>
            {groupedPosts.map((group) => (
              <View key={group.key} style={styles.monthSection}>
                <SectionHeader
                  title={group.title}
                  subtitle={`${group.items.length} ${group.items.length === 1 ? 'memory' : 'memories'}`}
                />

                <View style={styles.monthGrid}>
                  {group.items.map((post) => (
                    <MemoryCard
                      key={post.id}
                      memory={post}
                      density="timeline"
                      aspectRatio={4 / 3}
                      onPress={() => router.push(`/post/${post.id}`)}
                      showMemoryId={true}
                    />
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.bottomSpacer} />
          </>
        )}
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  monthSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  monthGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
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
