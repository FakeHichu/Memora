import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { Button } from '@/components/ui/Button';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Skeleton, SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icons';
import {
  getLocalPhotoPosts,
  hasPostedToday,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { supabase } from '@/lib/supabase/client';
import { useClass } from '@/hooks/useClass';
import { getBackendUrl } from '@/lib/photo-upload';

export default function CircleScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { classes, activeClass, isLoading: isClassLoading, selectClass, refreshClasses } = useClass();
  const [sharedPosts, setSharedPosts] = useState<(LocalPhotoPost & { authorName?: string })[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userPostedToday, setUserPostedToday] = useState(false);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (activeClass?.id && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const backendUrl = getBackendUrl();
          const response = await fetch(`${backendUrl}/api/classes/${activeClass.id}/feed/today`, {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });

          if (response.ok) {
            const feedData = await response.json();
            setUserPostedToday(Boolean(feedData.userPostedToday));
            const serverPosts = (feedData.posts || []).map((p: any) => ({
              id: p.id,
              uri: p.photoUrl || p.photo_path,
              caption: p.caption || '',
              prompt: p.prompt_text || undefined,
              authorName: p.authorName || 'Classmate',
              category: 'General' as const,
              createdAt: p.created_at || new Date().toISOString(),
              reactions: p.reactionsMap || {},
              userReaction: p.userReaction || null,
            }));
            setSharedPosts(serverPosts);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback: local posts
      const savedPosts = await getLocalPhotoPosts();
      setSharedPosts(savedPosts);
      setUserPostedToday(hasPostedToday(savedPosts));
    } catch {
      try {
        const savedPosts = await getLocalPhotoPosts();
        setSharedPosts(savedPosts);
        setUserPostedToday(hasPostedToday(savedPosts));
      } catch {
        setSharedPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeClass?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshClasses();
    await loadPosts();
    setIsRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refreshClasses();
      loadPosts();
    }, [refreshClasses, loadPosts])
  );

  const handleCopyCode = () => {
    if (activeClass?.join_code) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(activeClass.join_code).catch(() => {});
      } else {
        try {
          Clipboard.setString(activeClass.join_code);
        } catch {
        }
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      if (Platform.OS !== 'web') {
        Alert.alert('Code Copied', `Invite code "${activeClass.join_code}" copied to clipboard.`);
      }
    }
  };

  const handleReact = async (postId: string, emoji: string) => {
    try {
      if (!supabase) return;
      const backendUrl = getBackendUrl();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;

      if (!userId || !sessionData?.session) return;

      const response = await fetch(`${backendUrl}/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reactionType: emoji,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Failed to save reaction.');
        return;
      }

      const result = await response.json();

      setSharedPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: result.reactionsMap || p.reactions,
            userReaction: result.userReaction,
          };
        })
      );

      if (result.reactionsMap) setReactionsMap(result.reactionsMap);
      if (result.userReactions) setUserReactions(result.userReactions);
    } catch {
      setErrorMessage('Failed to save reaction.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <AppHeader
          title="Circle"
          subtitle={activeClass ? `You are in ${activeClass.name}` : 'Shared class memories'}
        />

        {/* Loading state */}
        {(isClassLoading || isLoading) && (
          <View style={{ gap: spacing.md }}>
            <Skeleton width="100%" height={140} borderRadius={radius.xl} />
            <SkeletonMemoryCard aspectRatio={4 / 3} variant="timeline" />
          </View>
        )}

        {/* If no class joined */}
        {!isClassLoading && !isLoading && !activeClass && (
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
            {/* Prominent Active Circle Identification Banner */}
            <View style={styles.activeCircleBanner}>
              <View style={styles.activeBannerTop}>
                <View style={styles.activeIndicatorRow}>
                  <View style={styles.activeDotPulse} />
                  <Text style={styles.activeIndicatorText}>CURRENT CIRCLE</Text>
                </View>
                {activeClass.join_code && (
                  <Pressable
                    onPress={handleCopyCode}
                    style={styles.codePill}
                    accessibilityRole="button"
                    accessibilityLabel="Copy invite code"
                  >
                    <Icon name="share" size={12} color={colors.accent} />
                    <Text style={styles.codePillText}>{activeClass.join_code}</Text>
                    <Text style={styles.codeCopyHint}>{copiedCode ? '✓' : 'Copy'}</Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() => router.push(`/class/${activeClass.id}`)}
                style={styles.classHeader}
                accessibilityRole="button"
                accessibilityLabel="View class details"
              >
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
              </Pressable>

              {/* Class Switcher if multiple classes */}
              {classes.length > 1 && (
                <View style={styles.switcherSection}>
                  <Text style={styles.switcherLabel}>SWITCH CIRCLE:</Text>
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
                </View>
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

            {/* Quick Upload Action inside this Circle */}
            <View style={styles.uploadCtaCard}>
              <View style={styles.uploadCtaInfo}>
                <Text style={styles.uploadCtaTitle}>
                  {userPostedToday ? "Post another memory" : "Post today's photo"}
                </Text>
                <Text style={styles.uploadCtaSubtitle}>
                  Visible to everyone in {activeClass.name}
                </Text>
              </View>
              <Button
                title={userPostedToday ? "Add Photo" : "Upload Photo"}
                variant="accent"
                size="md"
                onPress={() => router.push('/(tabs)/create')}
              />
            </View>

            {/* Today's Circle Feed */}
            <SectionHeader
              title={`Memories in ${activeClass.name}`}
              subtitle={
                userPostedToday
                  ? `${sharedPosts.length} shared memory${sharedPosts.length === 1 ? '' : 'ies'} revealed`
                  : 'Post your photo to unblur classmates'
              }
            />

            {isLoading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading circle memories…</Text>
              </View>
            ) : sharedPosts.length === 0 ? (
              <EmptyState
                title={`No memories posted in ${activeClass.name} yet`}
                message="Be the first one in your class to upload a photo and start today's memory feed!"
                variant="prompt"
                action={{
                  label: 'Post photo to this circle',
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
                    authorName={post.authorName}
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
                title="Join another circle"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/(onboarding)/join-class')}
              />
              <Button
                title="Create a circle"
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    activeCircleBanner: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.xxl,
      borderWidth: 1.5,
      borderColor: colors.accent,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }),
    },
    activeBannerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: borders.hairline,
      borderBottomColor: colors.borderSoft,
    },
    activeIndicatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    activeDotPulse: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    activeIndicatorText: {
      ...typography.mono.micro,
      color: colors.accent,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    codePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.hairline,
      borderColor: colors.accent,
      borderRadius: radius.round,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
    },
    codePillText: {
      ...typography.mono.caption,
      fontWeight: '700',
      color: colors.accent,
    },
    codeCopyHint: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      fontSize: 10,
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
      ...typography.serif.title2,
      color: colors.textPrimary,
      fontWeight: '700',
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
    switcherSection: {
      marginBottom: spacing.md,
      paddingTop: spacing.xs,
    },
    switcherLabel: {
      ...typography.mono.micro,
      color: colors.textMuted,
      marginBottom: 6,
      letterSpacing: 0.8,
    },
    classSwitcher: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingVertical: 2,
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
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    classPillText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    classPillTextActive: {
      color: colors.textInverse,
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
    uploadCtaCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.accentSubtle,
      borderRadius: radius.xl,
      borderWidth: borders.hairline,
      borderColor: colors.accent,
    },
    uploadCtaInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    uploadCtaTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    uploadCtaSubtitle: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      marginTop: 2,
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
}
