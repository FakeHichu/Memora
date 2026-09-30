import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';

export default function YearbookScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getLocalPhotoPosts().then((savedPosts) => {
        if (isActive) setPosts(savedPosts);
      });
      return () => {
        isActive = false;
      };
    }, []),
  );

  const months = Array.from(new Set(posts.map((post) => {
    const date = new Date(post.createdAt);
    return `${date.getFullYear()}-${date.getMonth()}`;
  }))).sort((left, right) => right.localeCompare(left));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Yearbook</Text>
        {months.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.monthText}>A year of little moments.</Text>
            <Text style={styles.meta}>Your saved photos will be collected here by month.</Text>
          </View>
        ) : months.map((monthKey) => {
          const [year, month] = monthKey.split('-').map(Number);
          const monthPosts = posts.filter((post) => {
            const date = new Date(post.createdAt);
            return date.getFullYear() === year && date.getMonth() === month;
          });
          const monthTitle = new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

          return (
            <View key={monthKey} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthText}>{monthTitle}</Text>
                <Text style={styles.meta}>{monthPosts.length}</Text>
              </View>
              <View style={styles.grid}>
                {monthPosts.map((post) => (
                  <Image key={post.id} source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" />
                ))}
              </View>
            </View>
          );
        })}
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
    maxWidth: 720,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  monthSection: {
    gap: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  monthText: {
    ...typography.subheading,
    color: colors.text,
  },
  meta: {
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photo: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
