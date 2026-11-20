import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, clearLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { IconButton } from '@/components/ui/IconButton';

export default function ProfileScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const { session, isLoading: isAuthLoading } = useAuth();
  const { circles } = useUnifiedCircle();

  const [photoCount, setPhotoCount] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [profilePosts, setProfilePosts] = useState<LocalPhotoPost[]>([]);
  const [supabaseProfile, setSupabaseProfile] = useState<{
    display_name?: string;
    email?: string;
    username?: string;
    bio?: string;
    avatar_path?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchData() {
        setIsLoading(true);
        // Load local photos
        try {
          const posts = await getLocalPhotoPosts();
          if (isActive) {
            const visiblePosts = posts.filter((p) => !p.isArchived);
            setProfilePosts(visiblePosts);
            setPhotoCount(visiblePosts.length);
            const totalReactions = posts.reduce((sum, p) => {
              return sum + Object.values(p.reactions || {}).reduce((s, v) => s + (v as number), 0);
            }, 0);
            setReactionCount(totalReactions);
          }
        } catch {}

        // Load Supabase profile
        if (supabase && session?.user?.id) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            if (!error && data && isActive) {
              setSupabaseProfile(data);
            }
          } catch {}
        }

        if (isActive) setIsLoading(false);
      }
      fetchData();
      return () => { isActive = false; };
    }, [session, isAuthLoading]),
  );

  const isSignedIn = Boolean(session?.user);
  const displayName =
    supabaseProfile?.display_name ||
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    session?.user?.email?.split('@')[0] ||
    'Memory Keeper';
  const displayEmail = session?.user?.email || '';
  const username = supabaseProfile?.username || displayName.toLowerCase().replace(/\s+/g, '_');
  const avatarUri =
    (supabaseProfile?.avatar_path?.startsWith('http') ? supabaseProfile.avatar_path : null) ||
    (session?.user?.user_metadata?.avatar_url as string | undefined) ||
    (session?.user?.user_metadata?.picture as string | undefined);

  const handleSignOut = async () => {
    if (hasSupabaseConfig) {
      await signOut();
      router.replace('/(auth)/login');
    }
  };

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of Memora?')) handleSignOut();
      return;
    }
    Alert.alert('Sign out?', 'You will be returned to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: handleSignOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern opacity={0.025} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <IconButton
            icon="cog"
            onPress={() => router.push('/settings')}
            variant="overlay"
            size="sm"
            accessibilityLabel="Open settings"
          />
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          <View style={styles.coverPhoto}>
            {profilePosts[0]?.uri ? (
              <Image source={{ uri: profilePosts[0].uri }} style={styles.coverImage} resizeMode="cover" />
            ) : null}
          </View>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar name={displayName} size={72} ring photoUri={avatarUri} />
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.username}>@{username}</Text>
            </View>
          </View>

          {/* Stats row: Memories | Circles | Reactions */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{photoCount}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{circles.length}</Text>
              <Text style={styles.statLabel}>Circles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{reactionCount}</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
          </View>

          {/* Edit Profile button */}
          <Pressable
            style={styles.editProfileBtn}
            onPress={() => router.push('/edit-profile')}
            accessibilityRole="button"
          >
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.memoryGridSection}>
          <Text style={styles.gridTitle}>Memories</Text>
          {profilePosts.length ? (
            <View style={styles.memoryGrid}>
              {profilePosts.slice(0, 18).map((post) => (
                <Pressable
                  key={post.id}
                  style={styles.memoryTile}
                  onPress={() => router.push(`/post/${post.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open memory${post.caption ? `: ${post.caption}` : ''}`}
                >
                  <Image source={{ uri: post.uri }} style={styles.memoryTileImage} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyMemories}>Your shared memories will appear here.</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
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
      gap: spacing.lg,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      ...typography.sans.title2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    profileCard: {
      marginHorizontal: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      gap: spacing.lg,
      overflow: 'hidden',
    },
    coverPhoto: {
      height: 118,
      marginTop: -spacing.lg,
      marginHorizontal: -spacing.lg,
      backgroundColor: colors.surfaceElevated,
    },
    coverImage: { width: '100%', height: '100%' },
    avatarSection: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: -52,
    },
    avatarWrapper: {},
    nameSection: {
      alignItems: 'center',
    },
    displayName: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    username: {
      ...typography.sans.footnote,
      color: colors.textMuted,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.sm,
      borderTopWidth: borders.hairline,
      borderTopColor: colors.borderSoft,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statValue: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    statLabel: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    statDivider: {
      width: borders.thin,
      height: 32,
      backgroundColor: colors.borderSoft,
    },
    editProfileBtn: {
      alignSelf: 'stretch',
      paddingVertical: spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
    },
    editProfileBtnText: {
      ...typography.sans.callout,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    memoryGridSection: {
      marginHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    gridTitle: {
      ...typography.sans.title3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    memoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    memoryTile: {
      width: '32%',
      aspectRatio: 1,
      borderRadius: radius.sm,
      overflow: 'hidden',
      backgroundColor: colors.surfaceElevated,
    },
    memoryTileImage: { width: '100%', height: '100%' },
    emptyMemories: {
      ...typography.sans.footnote,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    themeLabel: {
      ...typography.sans.callout,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    themeOptions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    themePill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
    },
    themePillActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    themePillText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    themePillTextActive: {
      color: colors.textOnPrimary,
      fontWeight: '700',
    },
    bottomSpacer: {
      height: spacing.huge,
    },
  });
}
