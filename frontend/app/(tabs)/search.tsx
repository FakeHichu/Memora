import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { Icon } from '@/components/ui/Icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function SearchScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocalPhotoPost[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const filtered = posts.filter((post) => {
      const caption = (post.caption || '').toLowerCase();
      const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
      const timeStr = new Date(post.createdAt).toLocaleTimeString().toLowerCase();
      return caption.includes(query) || dateStr.includes(query) || timeStr.includes(query);
    });

    setResults(filtered);
  }, [searchQuery, posts]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader title="Search" subtitle="Find your memories" />

        {/* Floating Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Icon name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search your memories…"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <Pressable
                onPress={handleClear}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
              >
                <Icon name="close" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {hasSearched && (
          <SectionHeader
            title={results.length === 1 ? '1 memory found' : `${results.length} memories found`}
          />
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading your memories…</Text>
          </View>
        ) : hasSearched && results.length === 0 ? (
          <EmptyState
            title="No memories found"
            message={`No memories match "${searchQuery}". Try a different search.`}
            icon="search"
            style={styles.emptyState}
          />
        ) : hasSearched && results.length > 0 ? (
          <View style={styles.resultsGrid}>
            {results.map((post) => (
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
        ) : !hasSearched && !isLoading ? (
          <View style={styles.suggestions}>
            <SectionHeader
              title="Recent"
              subtitle={`${posts.length} ${posts.length === 1 ? 'memory' : 'memories'}`}
            />
            <View style={styles.resultsGrid}>
              {posts.slice(0, 6).map((post) => (
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
        ) : null}

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
  searchIcon: {
    fontSize: 20,
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
  clearIcon: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  resultsGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
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
    paddingTop: spacing.xxxl,
  },
  suggestions: {
    paddingHorizontal: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.huge,
  },
});