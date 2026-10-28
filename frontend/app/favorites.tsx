import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { getFavoritePosts, toggleFavorite, type LocalPhotoPost } from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { IconButton } from '@/components/ui/IconButton';

type FavoriteSection = {
  key: string;
  title: string;
  data: LocalPhotoPost[];
};

export default function FavoritesScreen() {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Group by month
  const sections: FavoriteSection[] = useMemo(() => {
    const grouped: Record<string, LocalPhotoPost[]> = {};
    for (const post of favorites) {
      const d = new Date(post.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(post);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          key,
          title: new Date(year, month).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          }),
          data: items,
        };
      });
  }, [favorites]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <IconButton
                icon="arrow-left"
                onPress={() => router.back()}
                variant="overlay"
                size="sm"
                accessibilityLabel="Go back"
              />
              <View style={styles.headerTitle}>
                <Text style={styles.titleEmoji}>⭐</Text>
                <Text style={styles.title}>Favorites</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {!isLoading && favorites.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{favorites.length} favorited</Text>
              </View>
            )}
          </>
        }
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeaderWrap}>
            <SectionHeader title={title} subtitle={`${data.length} memories`} />
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => handleToggleFavorite(item.id)}
            style={styles.cardContainer}
            accessibilityRole="button"
            accessibilityLabel={`Long press to unfavorite: ${item.caption || 'memory'}`}
          >
            <MemoryCard
              memory={item}
              density="timeline"
              aspectRatio={4 / 3}
              onPress={() => router.push(`/post/${item.id}`)}
              showMemoryId
              showTags
            />
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingList}>
              {[0, 1, 2].map((i) => (
                <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No favorites yet"
              message="Tap the star ⭐ on any memory to save it here for quick access."
              variant="star"
              action={{
                label: 'Browse memories',
                onPress: () => router.push('/(tabs)/memories'),
                variant: 'accent',
              }}
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
  titleEmoji: {
    fontSize: 22,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
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
  sectionHeaderWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  loadingList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
  bottomSpacer: {
    height: 40,
  },
});
