import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';

const prompt = 'Show us something interesting you saw today.';
const currentDate = new Date();
const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
const day = currentDate.getDate();
export default function TodayScreen() {
  const [localPhotoPosts, setLocalPhotoPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getLocalPhotoPosts()
        .then((posts) => {
          if (isActive) setLocalPhotoPosts(posts);
        })
        .catch(() => {
          if (isActive) setLocalPhotoPosts([]);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <View style={styles.dateBlock}>
            <Text style={styles.kicker}>{weekday.toUpperCase()}, {month} {day}</Text>
            <Text style={styles.date}>Your photo journal.</Text>
          </View>
          <View style={styles.dayMark}>
            <Text style={styles.dayMarkNumber}>{day}</Text>
            <Text style={styles.dayMarkMonth}>{month}</Text>
          </View>
        </View>

        <Card style={styles.promptCard}>
          <Badge label="Today’s prompt" tone="neutral" />
          <Text style={styles.promptTitle}>{prompt}</Text>
          <Button title="Take today’s photo" onPress={() => router.push('/camera')} style={styles.promptButton} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your photos</Text>
          <Text style={styles.subtle}>{localPhotoPosts.length}</Text>
        </View>

        {isLoading ? <Text style={styles.emptyMessage}>Loading your photos…</Text> : null}
        {!isLoading && localPhotoPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Start with one moment.</Text>
            <Text style={styles.emptyMessage}>Photos you take will be saved privately on this device.</Text>
          </View>
        ) : null}

        {localPhotoPosts.map((post) => (
          <Card key={post.id} style={styles.photoCard}>
            <Image source={{ uri: post.uri }} style={styles.photoPreview} resizeMode="cover" />
            <Text style={styles.photoCaption}>{post.caption || 'A moment from today'}</Text>
            <Text style={styles.photoDate}>{new Date(post.createdAt).toLocaleString()}</Text>
          </Card>
        ))}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dateBlock: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  date: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xs,
  },
  dayMark: {
    width: 54,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayMarkNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 23,
  },
  dayMarkMonth: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  promptCard: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  promptTitle: {
    ...typography.heading,
    color: '#FFFFFF',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  promptButton: {
    alignSelf: 'stretch',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.xs,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    flexShrink: 1,
  },
  subtle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  emptyState: {
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.muted,
  },
  photoCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  photoCaption: {
    ...typography.subheading,
    color: colors.text,
  },
  photoDate: {
    ...typography.caption,
    color: colors.muted,
  },
});
