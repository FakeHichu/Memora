import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { clearLocalPhotoPosts, getLocalPhotoPosts, getLocalProfile } from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonProfileHeader } from '@/components/ui/Skeleton';

export default function ProfileScreen() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [photoCount, setPhotoCount] = useState(0);
  const [localProfile, setLocalProfile] = useState<{ name: string; handle: string; email: string }>(
    {
      name: 'Memory Keeper',
      handle: '@memora',
      email: '',
    },
  );
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getLocalPhotoPosts(), getLocalProfile()]).then(([posts, prof]) => {
        if (isActive) {
          setPhotoCount(posts.length);
          setLocalProfile(prof);
          setIsLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, []),
  );

  const isSignedIn = Boolean(session?.user);
  const displayName =
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    session?.user?.email?.split('@')[0] ||
    localProfile.name;
  const displayEmail = session?.user?.email || localProfile.email;

  const confirmClearPhotos = () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (
        typeof window !== 'undefined' &&
        window.confirm('Delete all photos? This permanently removes the photos saved in this app.')
      ) {
        clearLocalPhotoPosts().then(() => setPhotoCount(0));
      }
      return;
    }
    Alert.alert('Delete all photos?', 'This permanently removes the photos saved in this app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete photos',
        style: 'destructive',
        onPress: () => {
          clearLocalPhotoPosts().then(() => setPhotoCount(0));
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    if (hasSupabaseConfig) {
      await signOut();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Profile" subtitle="Your account" />

        {/* Loading Skeleton */}
        {(isLoading || isAuthLoading) && (
          <View style={styles.skeletonWrapper}>
            <SkeletonProfileHeader />
          </View>
        )}

        {/* Account Section */}
        {!isLoading && !isAuthLoading && (
          <>
            <ProfileSection title="Account" style={styles.accountSection}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{displayName}</Text>
                  <Text style={styles.profileStatus}>
                    {isSignedIn ? 'Signed in with email' : 'Using local storage only'}
                  </Text>
                </View>
              </View>

              {isSignedIn && (
                <>
                  <ProfileDivider />
                  {displayEmail ? (
                    <ProfileRow label="Email" value={displayEmail} icon="envelope" />
                  ) : null}
                  <ProfileDivider />
                  <ProfileRow
                    label="Sign out"
                    value=""
                    icon="door"
                    onPress={handleSignOut}
                    destructive
                  />
                </>
              )}

              {!isSignedIn && hasSupabaseConfig && (
                <>
                  <ProfileDivider />
                  <ProfileRow
                    label="Sign in"
                    value="Connect your account to sync across devices"
                    icon="padlock"
                    onPress={() => router.push('/(auth)/login')}
                  />
                </>
              )}
            </ProfileSection>

            {/* Photo Storage Section */}
            <ProfileSection title="Photo Storage">
              <ProfileRow
                label="Photos saved"
                value={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}
                icon="camera"
              />
              <ProfileDivider />
              <ProfileRow
                label="Storage location"
                value={hasSupabaseConfig && isSignedIn ? 'Cloud (Supabase)' : 'This device only'}
                icon="cloud"
              />
              <ProfileDivider />
              <ProfileRow label="Offline mode" value="Always available locally" icon="cloud" />

              {photoCount > 0 && (
                <>
                  <ProfileDivider />
                  <ProfileRow
                    label="Delete all photos"
                    value="This cannot be undone"
                    icon="trash"
                    onPress={confirmClearPhotos}
                    destructive
                  />
                </>
              )}
            </ProfileSection>

            {/* Notifications Section */}
            <ProfileSection title="Notifications">
              <ProfileRow label="Daily reminder" value="9:00 PM" icon="clock" />
              <ProfileDivider />
              <ProfileRow label="Memory notifications" value="On" icon="bell" />
            </ProfileSection>

            {/* Settings & Preferences */}
            <ProfileSection title="Preferences">
              <ProfileRow
                label="Settings"
                value="Appearance, notifications, data"
                icon="cog"
                onPress={() => router.push('/settings')}
              />
              <ProfileDivider />
              <ProfileRow
                label="Collections"
                value="Manage memory collections"
                icon="folder"
                onPress={() => router.push('/collections')}
              />
            </ProfileSection>
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
  skeletonWrapper: {
    marginTop: spacing.lg,
  },
  accountSection: {
    marginTop: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.display,
    color: colors.textOnChrome,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  profileStatus: {
    ...typography.subheadline,
    color: colors.textMuted,
    marginTop: 1,
  },
  bottomSpacer: {
    height: spacing.huge,
  },
});
