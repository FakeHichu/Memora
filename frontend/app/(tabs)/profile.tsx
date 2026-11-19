import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, clearLocalPhotoPosts } from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { useUnifiedCircle } from '@/contexts/CircleContext';

export default function ProfileScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  const { session, isLoading: isAuthLoading } = useAuth();
  const { circles } = useUnifiedCircle();

  const [photoCount, setPhotoCount] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [supabaseProfile, setSupabaseProfile] = useState<{
    display_name?: string;
    email?: string;
    username?: string;
    bio?: string;
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
            setPhotoCount(posts.filter((p) => !p.isArchived).length);
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
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          {/* Avatar + Name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar name={displayName} size={72} ring />
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
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
          >
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <ProfileSection title="Account">
          {isSignedIn ? (
            <>
              {displayEmail ? (
                <ProfileRow label="Email" value={displayEmail} icon="envelope" />
              ) : null}
              {supabaseProfile?.username && (
                <>
                  <ProfileDivider />
                  <ProfileRow label="Username" value={`@${supabaseProfile.username}`} icon="user" />
                </>
              )}
            </>
          ) : (
            <ProfileRow
              label="Sign in"
              value="Connect your account"
              icon="padlock"
              onPress={() => router.push('/(auth)/login')}
            />
          )}
        </ProfileSection>

        {/* Appearance */}
        <ProfileSection title="Appearance">
          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>Theme</Text>
            <View style={styles.themeOptions}>
              <Pressable
                onPress={() => setMode('dark')}
                style={[styles.themePill, mode === 'dark' && styles.themePillActive]}
              >
                <Text style={[styles.themePillText, mode === 'dark' && styles.themePillTextActive]}>
                  🌙 Dark
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('light')}
                style={[styles.themePill, mode === 'light' && styles.themePillActive]}
              >
                <Text style={[styles.themePillText, mode === 'light' && styles.themePillTextActive]}>
                  ☀️ Latte
                </Text>
              </Pressable>
            </View>
          </View>
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Settings">
          <ProfileRow
            label="Account Settings"
            value=""
            icon="user"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Notifications"
            value=""
            icon="bell"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Privacy & Security"
            value=""
            icon="padlock"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Appearance"
            value={mode === 'dark' ? 'Dark ›' : 'Latte ›'}
            icon="cog"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="About Memora"
            value=""
            icon="cloud"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Help & Support"
            value=""
            icon="info"
            onPress={() => router.push('/settings')}
          />
        </ProfileSection>

        {/* Sign out */}
        {isSignedIn && (
          <ProfileSection title="">
            <ProfileRow
              label="Log Out"
              value=""
              icon="door"
              onPress={confirmSignOut}
              destructive
            />
          </ProfileSection>
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
      gap: spacing.lg,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
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
    },
    avatarSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatarWrapper: {},
    nameSection: {
      flex: 1,
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
