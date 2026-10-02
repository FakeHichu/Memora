import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Badge } from '@/components/ui/Badge';

export default function CircleScreen() {
  const [sharedPosts, setSharedPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getLocalPhotoPosts()
        .then((savedPosts) => {
          if (isActive) {
            setSharedPosts(savedPosts);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isActive) {
            setSharedPosts([]);
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const currentClass = {
    name: '12-A',
    school: 'Northfield Academy',
    year: '2026',
    memberCount: 24,
    photoCount: sharedPosts.length,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Circle" subtitle="Our memories" />

        {/* Class Info Card */}
        <View style={styles.classCard}>
          <View style={styles.classHeader}>
            <View style={styles.classAvatar}>
              <Text style={styles.classAvatarText}>{currentClass.name.split('-')[0]}</Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{currentClass.name}</Text>
              <Text style={styles.classSchool}>{currentClass.school}</Text>
              <Text style={styles.classYear}>{currentClass.year}</Text>
            </View>
          </View>

          <View style={styles.classStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{currentClass.memberCount}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{currentClass.photoCount}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
          </View>
        </View>

        {/* Shared Memories Section */}
        <SectionHeader
          title="Shared Memories"
          subtitle={
            sharedPosts.length > 0
              ? `${sharedPosts.length} ${sharedPosts.length === 1 ? 'memory' : 'memories'}`
              : 'No shared memories yet'
          }
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading shared memories…</Text>
          </View>
        ) : sharedPosts.length === 0 ? (
          <EmptyState
            title="No shared memories yet"
            message="When classmates post their daily photos, they'll appear here."
            icon="users"
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.sharedGrid}>
            {sharedPosts.slice(0, 6).map((post, index) => (
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
        )}

        {/* Class Members Section */}
        <SectionHeader title="Class Members" subtitle={`${currentClass.memberCount} members`} />

        <View style={styles.membersList}>
          {Array.from({ length: Math.min(currentClass.memberCount, 8) }, (_, i) => (
            <View key={i} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.memberName}>Classmate {i + 1}</Text>
              <Badge
                label={i === 0 ? 'Owner' : i < 3 ? 'Admin' : 'Member'}
                tone={i === 0 ? 'accent' : i < 3 ? 'chrome' : 'subtle'}
                size="sm"
              />
            </View>
          ))}
          {currentClass.memberCount > 8 && (
            <View style={styles.seeAllMembers}>
              <Text style={styles.seeAllText}>See all {currentClass.memberCount} members</Text>
            </View>
          )}
        </View>

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
  classCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  classAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classAvatarText: {
    ...typography.title,
    color: colors.accent,
    fontWeight: '700',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  classSchool: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: 1,
  },
  classYear: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  classStats: {
    flexDirection: 'row',
    paddingTop: spacing.lg,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSoft,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: borders.hairline,
    height: 32,
    backgroundColor: colors.borderSoft,
  },
  statValue: {
    ...typography.serif.title,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  sharedGrid: {
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
    ...typography.body,
    color: colors.textMuted,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  membersList: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  memberAvatarText: {
    ...typography.headline,
    color: colors.accent,
    fontWeight: '700',
  },
  memberName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  seeAllMembers: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.huge,
  },
});
