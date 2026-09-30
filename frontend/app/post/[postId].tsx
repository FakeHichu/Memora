import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { getLocalPhotoPost, type LocalPhotoPost } from '@/lib/photo-draft';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getLocalPhotoPost(postId).then((savedPost) => {
        if (isActive) setPost(savedPost);
      });
      return () => {
        isActive = false;
      };
    }, [postId]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {post ? (
          <>
            <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" />
            <Text style={styles.caption}>{post.caption || 'A moment from today'}</Text>
            <Text style={styles.meta}>{new Date(post.createdAt).toLocaleString()}</Text>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Photo not found</Text>
            <Text style={styles.meta}>It may have been deleted from this device.</Text>
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
    maxWidth: 640,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  meta: {
    color: colors.muted,
  },
  caption: {
    ...typography.subheading,
    color: colors.text,
  },
});
