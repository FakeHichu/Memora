import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, layout, breakpoints, shadows } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { getFavoritePosts, toggleFavorite, type LocalPhotoPost } from '@/lib/photo-draft';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { Icon } from '@/components/ui/Icons';
export default function FavoritesScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const { showToast } = useToast();
  const { width: screenWidth } = useWindowDimensions();
  const [favorites, setFavorites] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
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
  const visibleFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return favorites.filter((post) => {
      if (post.isArchived) return false;
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
    });
  }, [favorites, searchQuery]);
  const columns =
    screenWidth >= breakpoints.desktop
      ? layout.photoGridColumns.desktop
      : screenWidth >= breakpoints.tablet
        ? layout.photoGridColumns.tablet
        : 2;
  const horizontalPadding = spacing.lg * 2;
  const gridGap = 14;
  const tileWidth = (screenWidth - horizontalPadding - gridGap * (columns - 1)) / columns;
  const tileImageHeight = tileWidth * 0.95;
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
    });
  const renderCard = (post: LocalPhotoPost) => (
    <Pressable
      key={post.id}
      style={[styles.recipeCard, { width: tileWidth }]}
      onPress={() => router.push(`/post/${post.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Favorite memory: ${post.title || post.caption || 'Untitled memory'}`}
    >
      {/* Top Header Row of Card (Title on left, circular heart on right) */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {post.title || post.caption || 'Memory'}
        </Text>
        <Pressable
          onPress={() => handleToggleFavorite(post.id)}
          style={styles.cardHeartButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Remove from favorites"
        >
          <Icon name="heart" size={15} color={colors.highlight} fill={colors.highlight} />
        </Pressable>
      </View>
      {/* Centered Rounded Image */}
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: post.uri }}
          style={[styles.cardImage, { height: tileImageHeight }]}
          resizeMode="cover"
        />
      </View>
      {/* Bottom Subtitle / Time badge */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {post.location || post.category || 'Special Moment'}
        </Text>
        <Text style={styles.cardTimeText}>{formatMemoryDate(post)}</Text>
      </View>
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Navigation Row (matching Screen 3) */}
        <View style={styles.navRow}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            variant="default"
            size="sm"
            accessibilityLabel="Go back"
          />
          <Text style={styles.navCenterTitle}>Favorites</Text>
          <IconButton
            icon="search"
            onPress={() => setShowSearch(!showSearch)}
            variant={showSearch ? 'accent' : 'default'}
            size="sm"
            accessibilityLabel="Search favorites"
          />
        </View>
        {/* Big Headline (matching Screen 3 "Favorite recipes") */}
        <View style={styles.headingBlock}>
          <Text style={styles.headingText}>Favorite memories</Text>
        </View>
        {/* Collapsible Search Bar */}
        {showSearch && (
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your favorites…"
              onClear={() => setSearchQuery('')}
              autoFocus={true}
            />
          </View>
        )}
        {isLoading ? (
          <View style={styles.loadingGrid}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonMemoryCard key={i} aspectRatio={1} variant="compact" />
            ))}
          </View>
        ) : visibleFavorites.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No favorites found' : 'No favorites yet'}
            message={
              searchQuery
                ? `No favorites match "${searchQuery}".`
                : 'Tap the heart on any memory to save it here for quick access.'
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
                {row.map((post) => renderCard(post))}
              </View>
            ))}
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: 110,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    navCenterTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    headingBlock: {
      paddingHorizontal: spacing.lg,
      marginTop: 6,
      marginBottom: 16,
    },
    headingText: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    },
    searchSection: {
      marginBottom: 12,
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
      gap: 14,
      marginBottom: 16,
    },
    recipeCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 10,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 16px rgba(48, 36, 61, 0.05)',
          } as any)
        : shadows.sm),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
      letterSpacing: -0.2,
      marginRight: 6,
    },
    cardHeartButton: {
      width: 28,
      height: 28,
      borderRadius: 999,
      backgroundColor: colors.surfaceOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    cardImageContainer: {
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.surfaceOverlay,
    },
    cardImage: {
      width: '100%',
    },
    cardFooter: {
      paddingHorizontal: 2,
      gap: 2,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    cardTimeText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '400',
    },
    bottomSpacer: {
      height: 30,
    },
  });
}