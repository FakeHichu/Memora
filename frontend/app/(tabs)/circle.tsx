import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Clipboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { Button } from '@/components/ui/Button';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import {
  getLocalPhotoPosts,
  hasPostedToday,
  toggleLocalPhotoReaction,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { useClass } from '@/hooks/useClass';

export default function CircleScreen() {
  const { classes, activeClass, isLoading: isClassLoading, selectClass } = useClass();
  const [sharedPosts, setSharedPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadPosts = useCallback(() => {
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
  }, []);

  useFocusEffect(loadPosts);

  const userPostedToday = hasPostedToday(sharedPosts);

  const handleCopyCode = () => {
    if (activeClass?.join_code) {
      Clipboard.setString(activeClass.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      Alert.alert('Code Copied', `Invite code "${activeClass.join_code}" copied to clipboard.`);
    }
  };

  const handleReact = async (postId: string, emoji: string) => {
    const updated = await toggleLocalPhotoReaction(postId, emoji);
    if (updated) {
      setSharedPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Circle"
          subtitle={activeClass ? activeClass.name : 'Shared class memories'}
        />

        {/* If no class joined */}
        {!isClassLoading && !activeClass && (
          <View style={styles.noClassContainer}>
            <EmptyState
              title="No Circle Joined Yet"
              message="Join an existing class using an invite code, or create a brand new private group for your classmates or friends."
              variant="users"
              action={{
                label: 'Enter Invite Code',
                onPress: () => router.push('/(onboarding)/join-class'),
                variant: 'accent',
              }}
              secondaryAction={{
                label: 'Create a Class',
                onPress: () => router.push('/(onboarding)/create-class'),
              }}
              style={styles.emptyState}
            />
          </View>
        )}

        {/* Active Class Info Card */}
        {activeClass && (
          <>
            <View style={styles.classCard}>
              <View style={styles.classHeader}>
                <View style={styles.classAvatar}>
                  <Text style={styles.classAvatarText}>
                    {activeClass.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{activeClass.name}</Text>
                  <Text style={styles.classSchool}>
                    {activeClass.school_name || 'Class Community'}
                  </Text>
                  <Text style={styles.classYear}>Class of {activeClass.academic_year}</Text>
                </View>

                {/* Invite code badge & button */}
                <Pressable
                  onPress={handleCopyCode}
                  style={styles.codeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Copy class invite code"
                >
                  <Text style={styles.codeLabel}>INVITE CODE</Text>
                  <Text style={styles.codeValue}>{activeClass.join_code}</Text>
                  <Text style={styles.copyHint}>{copiedCode ? '✓ Copied' : 'Tap to copy'}</Text>
                </Pressable>
              </View>

              {/* Class Switcher if multiple classes */}
              {classes.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.classSwitcher}
                >
                  {classes.map((cls) => (
                    <Pressable
                      key={cls.id}
                      onPress={() => selectClass(cls.id)}
                      style={[
                        styles.classPill,
                        cls.id === activeClass.id && styles.classPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.classPillText,
                          cls.id === activeClass.id && styles.classPillTextActive,
                        ]}
                      >
                        {cls.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              <View style={styles.classStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{activeClass.member_count || 1}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{sharedPosts.length}</Text>
                  <Text style={styles.statLabel}>Memories</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{userPostedToday ? '🔥 Active' : 'Pending'}</Text>
                  <Text style={styles.statLabel}>Today's Status</Text>
                </View>
              </View>
            </View>

            {/* Today's Circle Feed */}
            <SectionHeader
              title="Today in Your Circle"
              subtitle={
                userPostedToday
                  ? 'All memories revealed for today'
                  : 'Post your photo to unblur classmates'
              }
            />

            {isLoading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading circle memories…</Text>
              </View>
            ) : sharedPosts.length === 0 ? (
              <EmptyState
                title="No memories posted today yet"
                message="Be the first one in your class to post today's memory!"
                variant="prompt"
                action={{
                  label: 'Post daily photo',
                  onPress: () => router.push('/(tabs)/create'),
                  variant: 'accent',
                }}
                style={styles.emptyState}
              />
            ) : (
              <View style={styles.feedColumn}>
                {sharedPosts.map((post) => (
                  <MemoryCard
                    key={post.id}
                    memory={post}
                    density="timeline"
                    aspectRatio={4 / 3}
                    onPress={() => router.push(`/post/${post.id}`)}
                    showMemoryId={true}
                    showReactions={true}
                    onReact={(emoji) => handleReact(post.id, emoji)}
                    isBlurred={!userPostedToday}
                  />
                ))}
              </View>
            )}

            {/* Class Actions */}
            <View style={styles.classActionsRow}>
              <Button
                title="Join another class"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/(onboarding)/join-class')}
              />
              <Button
                title="Create a class"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/(onboarding)/create-class')}
              />
            </View>
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
    paddingBottom: spacing.xxxl + layout.tabBarHeight,
  },
  noClassContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  orText: {
    ...typography.sans.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  createButton: {
    width: '100%',
  },
  classCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  classAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classAvatarText: {
    ...typography.serif.title,
    color: colors.accent,
    fontWeight: '700',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  classSchool: {
    ...typography.sans.subheadline,
    color: colors.textSecondary,
    marginTop: 1,
  },
  classYear: {
    ...typography.sans.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  codeButton: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  codeLabel: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  codeValue: {
    ...typography.mono.body,
    fontWeight: '700',
    color: colors.accent,
    marginVertical: 1,
  },
  copyHint: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    fontSize: 9,
  },
  classSwitcher: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  classPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  classPillActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  classPillText: {
    ...typography.sans.caption,
    color: colors.textSecondary,
  },
  classPillTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  classStats: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSoft,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: borders.hairline,
    height: 28,
    backgroundColor: colors.borderSoft,
  },
  statValue: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  feedColumn: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
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
  },
  classActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
});