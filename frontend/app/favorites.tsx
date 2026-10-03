import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getFavoritePosts,
  toggleFavorite,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { IconButton } from '@/components/ui/IconButton';

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
  const grouped: Record<string, LocalPhotoPost[]> = {};
  for (const post of favorites) {
    const d = new Date(post.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(post);
  }

  const groups = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        key,
        title: new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        items,
      };
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2].map((i) => (
              <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
            ))}
          </View>
        ) : favorites.length === 0 ? (
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
        ) : (
          <>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favorites.length} favorited</Text>
            </View>

            {groups.map((group) => (
              <View key={group.key} style={styles.monthGroup}>
                <SectionHeader
                  title={group.title}
                  subtitle={`${group.items.length} memories`}
                />
                <View style={styles.list}>
                  {group.items.map((post) => (
                    <Pressable
                      key={post.id}
                      onLongPress={() => handleToggleFavorite(post.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Long press to unfavorite: ${post.caption || 'memory'}`}
                    >
                      <MemoryCard
                        memory={post}
                        density="timeline"
                        aspectRatio={4 / 3}
                        onPress={() => router.push(`/post/${post.id}`)}
                        showMemoryId
                        showTags
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
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
  monthGroup: {
    marginBottom: spacing.xl,
  },
  list: {
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
