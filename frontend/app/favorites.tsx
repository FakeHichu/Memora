import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography, layout, borders, breakpoints } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { getFavoritePosts, toggleFavorite, type LocalPhotoPost } from '@/lib/photo-draft';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';

export default function FavoritesScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { showToast } = useToast();
  const { width: screenWidth } = useWindowDimensions();
  const [favorites, setFavorites] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFavorites = useCallback(() => {
    let isActive = true;
    setIsLoading(true);

    getFavoritePosts()
      .then((posts) => {
        if (isActive) {
          setFavorites(posts);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setFavorites([]);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadFavorites);

  const handleToggleFavorite = async (postId: string) => {
    const updated = await toggleFavorite(postId);
    if (updated) {
      setFavorites((prev) => prev.filter((p) => p.id !== postId));
      showToast({ message: 'Removed from favorites', variant: 'default', duration: 1500 });
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
    return caption.includes(query) || title.includes(query) || location.includes(query) || tags.includes(query) || dateStr.includes(query);
  };

  const visibleFavorites = useMemo(
    () => favorites.filter((post) => !post.isArchived && matchesSearch(post)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favorites, searchQuery],
  );

  const columns =
    screenWidth >= breakpoints.desktop
      ? layout.photoGridColumns.desktop
      : screenWidth >= breakpoints.tablet
        ? layout.photoGridColumns.tablet
        : layout.photoGridColumns.phone;

  const horizontalPadding = spacing.lg * 2;
  const gridGap = spacing.sm;
  const tileWidth = (screenWidth - horizontalPadding - gridGap * (columns - 1)) / columns;
  const tileHeight = tileWidth;

  const rows = useMemo(() => {
    const result: LocalPhotoPost[][] = [];
    for (let i = 0; i < visibleFavorites.length; i += columns) {
      result.push(visibleFavorites.slice(i, i + columns));
    }
    return result;
  }, [visibleFavorites, columns]);

  const formatMemoryDate = (post: LocalPhotoPost) =>
    new Date(post.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const renderTile = (post: LocalPhotoPost) => (
    <Pressable
      style={[styles.tile, { width: tileWidth }]}
      onPress={() => router.push(`/post/${post.id}`)}
      onLongPress={() => handleToggleFavorite(post.id)}
      accessibilityRole="button"
      accessibilityLabel={`Favorite memory: ${post.caption || post.title || 'Untitled memory'}`}
    >
      <Image source={{ uri: post.uri }} style={[styles.tileImage, { height: tileHeight }]} resizeMode="cover" />
      <View style={styles.tileCaption}>
        <Text style={styles.tileCaptionText} numberOfLines={2}>
          {post.title || post.caption || 'Untitled memory'}
        </Text>
        <Text style={styles.tileCaptionDate}>{formatMemoryDate(post)}</Text>
      </View>
      <IconButton
        icon="star"
        onPress={() => handleToggleFavorite(post.id)}
        variant={post.isFavorite ? 'accent' : 'default'}
        size="sm"
        style={styles.favoriteToggle}
        accessibilityLabel="Remove from favorites"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            variant="default"
            size="sm"
            accessibilityLabel="Go back"
          />
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Your favorite moments.</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {!isLoading && favorites.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favorites.length} favorited</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your favorites…"
            onClear={() => setSearchQuery('')}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingGrid}>
            {[0, 1, 2, 4, 5, 6].map((i) => (
              <SkeletonMemoryCard key={i} aspectRatio={1} variant="compact" />
            ))}
          </View>
        ) : visibleFavorites.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No favorites found' : 'No favorites yet'}
            message={
              searchQuery
                ? `No favorites match "${searchQuery}".`
                : 'Tap the star ⭐ on any memory to save it here for quick access.'
            }
            variant={searchQuery ? 'search' : 'star'}
            action={
              !searchQuery
                ? {
                    label: 'Browse memories',
                    onPress: () => router.push('/(tabs)/memories'),
                    variant: 'accent',
                  }
                : undefined
            }
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.grid}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((post) => renderTile(post))}
              </View>
            ))}
          </View>
        )}

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
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      ...typography.serif.title2,
      color: colors.textPrimary,
    },
    headerSpacer: {
      width: 36,
    },
    countBadge: {
      alignSelf: 'flex-start',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.accentSubtle,
      borderRadius: radius.round,
      borderWidth: borders.hairline,
      borderColor: colors.accent,
    },
    countText: {
      ...typography.sans.caption,
      color: colors.accent,
      fontWeight: '700',
    },
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    loadingGrid: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    emptyState: {
      marginHorizontal: spacing.lg,
      paddingVertical: spacing.xxxl,
    },
    grid: {
      paddingHorizontal: spacing.lg,
    },
    gridRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    tile: {
      borderRadius: radius.md,
      overflow: 'hidden',
      backgroundColor: colors.backgroundSecondary,
    },
    tileImage: {
      width: '100%',
      backgroundColor: colors.backgroundSecondary,
    },
    tileCaption: {
      padding: spacing.sm,
      paddingTop: spacing.xs,
      backgroundColor: colors.card,
    },
    tileCaptionText: {
      ...typography.sans.callout,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    tileCaptionDate: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      marginTop: 2,
    },
    favoriteToggle: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
    },
    bottomSpacer: {
      height: 40,
    },
  });
}
