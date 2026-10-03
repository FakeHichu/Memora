import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { clearLocalPhotoPosts, getLocalPhotoPosts } from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function ProfileScreen() {
  const [photoCount, setPhotoCount] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const refreshPhotoCount = useCallback(() => {
    getLocalPhotoPosts().then((posts) => setPhotoCount(posts.length));
  }, []);

  useFocusEffect(refreshPhotoCount);

  useFocusEffect(
    useCallback(() => {
      if (hasSupabaseConfig) {
        setIsSignedIn(true);
        setUserName('Alex Morgan');
      }
    }, []),
  );

  const confirmClearPhotos = () => {
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
      setIsSignedIn(false);
      setUserName('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Profile" subtitle="Your account" />

        {/* Account Section */}
        <ProfileSection title="Account" style={styles.accountSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName ? userName.charAt(0) : 'A'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName || 'Local User'}</Text>
              <Text style={styles.profileStatus}>
                {isSignedIn ? 'Signed in with email' : 'Using local storage only'}
              </Text>
            </View>
          </View>

          {isSignedIn && (
            <>
              <ProfileDivider />
              <ProfileRow label="Email" value="alex@example.com" icon="envelope" />
              <ProfileDivider />
              <ProfileRow label="Sign out" value="" icon="door" onPress={handleSignOut} destructive />
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
          <ProfileRow label="Auto-backup" value="Enabled" icon="cloud" />

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

        {/* About Section */}
        <ProfileSection title="About">
          <ProfileRow label="Version" value="1.0.0" icon="info" />
          <ProfileDivider />
          <ProfileRow
            label="Privacy Policy"
            value="View our privacy policy"
            icon="file"
            onPress={() => console.log('Open privacy policy')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Terms of Service"
            value="Read our terms"
            icon="file"
            onPress={() => console.log('Open terms')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Open Source Licenses"
            value="View licenses"
            icon="file"
            onPress={() => console.log('Open licenses')}
          />
        </ProfileSection>

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
