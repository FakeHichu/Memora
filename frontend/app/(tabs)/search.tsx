import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icons';
import { FilterChips } from '@/components/ui/FilterChips';

const SEARCH_FILTERS = ['All', 'Favorites', 'People', 'Places', 'Events'];

// Highlight matching text in search results
function HighlightedText({
  text,
  query,
  style,
}: {
  text: string;
  query: string;
  style?: object;
}) {
  if (!query.trim() || !text) {
    return <Text style={style}>{text}</Text>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={highlightStyle.match}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

const highlightStyle = {
  match: {
    backgroundColor: 'rgba(122, 159, 216, 0.25)',
    color: colors.accent,
    fontWeight: '700' as const,
    borderRadius: 2,
  },
};

export default function SearchScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<LocalPhotoPost[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      Promise.all([getLocalPhotoPosts(), getRecentSearches()])
        .then(([savedPosts, savedSearches]) => {
          if (isActive) {
            setPosts(savedPosts);
            setRecentSearches(savedSearches);
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Run search when debounced query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = debouncedQuery.toLowerCase().trim();

      if (!query) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setHasSearched(true);

      let filtered = posts.filter((post) => {
        if (!post.isArchived) {
          const caption = (post.caption || '').toLowerCase();
          const title = (post.title || '').toLowerCase();
          const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
          const timeStr = new Date(post.createdAt).toLocaleTimeString().toLowerCase();
          const tags = (post.tags || []).join(' ').toLowerCase();
          const prompt = (post.prompt || '').toLowerCase();
          const location = (post.location || '').toLowerCase();
          return (
            caption.includes(query) ||
            title.includes(query) ||
            dateStr.includes(query) ||
            timeStr.includes(query) ||
            tags.includes(query) ||
            prompt.includes(query) ||
            location.includes(query)
          );
        }
        return false;
      });

      // Apply filter
      if (selectedFilter !== 'All') {
        if (selectedFilter === 'Favorites') {
          filtered = filtered.filter((p) => p.isFavorite);
        } else {
          filtered = filtered.filter((p) => p.category === selectedFilter);
        }
      }

      setResults(filtered);
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedQuery, posts, selectedFilter]);

  // Save search when user stops typing and there are results
  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    if (results.length === 0) return;

    addRecentSearch(debouncedQuery.trim()).then(() => {
      getRecentSearches().then(setRecentSearches);
    });
  }, [debouncedQuery, results.length]);

  // Web keyboard shortcut: / to focus search
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setHasSearched(false);
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
  };

  const handleClearRecentSearches = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const recentPosts = posts.filter((p) => !p.isArchived).slice(0, 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          title="Search"
          subtitle={
            hasSearched
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
              : 'Find your memories'
          }
        />

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Icon name="search" size={20} color={colors.textMuted} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search memories, tags, locations…"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              returnKeyType="search"
              accessibilityLabel="Search memories"
            />
            {searchQuery ? (
              <Pressable
                onPress={handleClear}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Icon name="close" size={16} color={colors.textMuted} />
              </Pressable>
            ) : Platform.OS === 'web' ? (
              <View style={styles.shortcutHint}>
                <Text style={styles.shortcutHintText}>/</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Filters */}
        {hasSearched && (
          <FilterChips
            filters={SEARCH_FILTERS}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        )}

        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonItem}>
                <SkeletonMemoryCard aspectRatio={1} variant="compact" />
              </View>
            ))}
          </View>
        ) : hasSearched && results.length === 0 ? (
          <EmptyState
            title="No memories found"
            message={`No memories match "${searchQuery}". Try different terms or check a different filter.`}
            variant="search"
            style={styles.emptyState}
          />
        ) : hasSearched && results.length > 0 ? (
          <>
            <SectionHeader
              title={
                results.length === 1 ? '1 memory found' : `${results.length} memories found`
              }
            />
            <View style={styles.resultsGrid}>
              {results.map((post) => (
                <View key={post.id} style={styles.gridItem}>
                  <MemoryCard
                    memory={post}
                    density="compact"
                    aspectRatio={1}
                    onPress={() => router.push(`/post/${post.id}`)}
                    showMemoryId={false}
                    showMetadata={false}
                    showTags={false}
                  />
                  {/* Caption preview with highlight */}
                  {post.caption && (
                    <HighlightedText
                      text={
                        post.caption.length > 60 ? post.caption.slice(0, 60) + '…' : post.caption
                      }
                      query={debouncedQuery}
                      style={styles.resultCaption}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <SectionHeader
                  title="Recent Searches"
                  action={{ label: 'Clear', onPress: handleClearRecentSearches }}
                />
                <View style={styles.recentList}>
                  {recentSearches.map((search, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.recentItem}
                      onPress={() => handleRecentSearchPress(search)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search for ${search}`}
                    >
                      <Icon name="clock" size={14} color={colors.textMuted} />
                      <Text style={styles.recentItemText}>{search}</Text>
                      <Icon name="chevron-right" size={14} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Recent Memories */}
            {recentPosts.length > 0 && (
              <View style={styles.recentSection}>
                <SectionHeader
                  title="Recent"
                  subtitle={`${posts.filter((p) => !p.isArchived).length} memories`}
                />
                <View style={styles.resultsGrid}>
                  {recentPosts.map((post) => (
                    <View key={post.id} style={styles.gridItem}>
                      <MemoryCard
                        memory={post}
                        density="compact"
                        aspectRatio={1}
                        onPress={() => router.push(`/post/${post.id}`)}
                        showMemoryId={false}
                        showMetadata={false}
                        showTags={false}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {recentPosts.length === 0 && !isLoading && (
              <EmptyState
                title="No memories yet"
                message="Create your first memory to start searching."
                variant="photo"
                action={{
                  label: 'Create a memory',
                  onPress: () => router.push('/(tabs)/create'),
                  variant: 'accent',
                }}
                style={styles.emptyState}
              />
            )}
          </>
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceFloating,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.sans.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  clearButton: {
    padding: spacing.xs,
  },
  shortcutHint: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.xs,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  shortcutHintText: {
    ...typography.mono.micro,
    color: colors.textMuted,
    fontSize: 12,
  },
  recentSection: {
    marginBottom: spacing.xl,
  },
  recentList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  recentItemText: {
    ...typography.sans.callout,
    color: colors.textSecondary,
    flex: 1,
  },
  resultsGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  gridItem: {
    width: '48%',
    gap: spacing.xs,
  },
  resultCaption: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  skeletonGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  skeletonItem: {
    width: '48%',
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
