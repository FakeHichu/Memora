import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';

export default function MemoriesScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Memories</Text>
          <Text style={styles.count}>{posts.length}</Text>
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your memories will live here.</Text>
            <Text style={styles.emptyMessage}>Take a photo from Today to start your collection.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {posts.map((post) => (
              <Pressable key={post.id} style={styles.photoItem} onPress={() => router.push(`/post/${post.id}`)}>
                <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" />
                <Text style={styles.caption} numberOfLines={2}>{post.caption || 'A moment from today'}</Text>
                <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</Text>
              </Pressable>
            ))}
          </View>
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
    maxWidth: 720,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  count: {
    color: colors.muted,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.muted,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    color: colors.muted,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoItem: {
    width: '48%',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
