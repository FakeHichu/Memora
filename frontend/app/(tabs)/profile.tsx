import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  getLocalProfile,
  saveLocalProfile,
  computeCurrentStreak,
  getMostActiveMonth,
  getFavoritePosts,
  type LocalProfile,
} from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonProfileHeader, SkeletonSettingsSection } from '@/components/ui/Skeleton';

export default function ProfileScreen() {
  const [photoCount, setPhotoCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mostActiveMonth, setMostActiveMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [localProfile, setLocalProfile] = useState<LocalProfile>({
    name: 'Memory Keeper',
    handle: '@memora',
    bio: 'Preserving everyday moments that matter.',
    email: '',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');

  const refreshProfileAndData = useCallback(() => {
    setIsLoading(true);

    Promise.all([getLocalPhotoPosts(), getFavoritePosts(), getLocalProfile()]).then(
      ([posts, favs, prof]) => {
        setPhotoCount(posts.filter((p) => !p.isArchived).length);
        setFavoriteCount(favs.length);
        setStreak(computeCurrentStreak(posts));
        setMostActiveMonth(getMostActiveMonth(posts));
        setLocalProfile(prof);
        setEditName(prof.name);
        setEditHandle(prof.handle);
        setEditBio(prof.bio);
        setIsLoading(false);
      },
    );

    if (hasSupabaseConfig && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setIsSignedIn(true);
          setUserEmail(data.session.user.email || '');
          const metaName = data.session.user.user_metadata?.display_name;
          if (metaName) {
            setLocalProfile((prev) => ({ ...prev, name: metaName }));
          }
        } else {
          setIsSignedIn(false);
        }
      });
    }
  }, []);

  useFocusEffect(refreshProfileAndData);

  const handleSaveProfile = async () => {
    const updated = await saveLocalProfile({
      name: editName.trim() || 'Memory Keeper',
      handle: editHandle.trim() || '@memora',
      bio: editBio.trim(),
    });
    setLocalProfile(updated);
    setEditModalVisible(false);
  };

  const handleSignOut = async () => {
    if (hasSupabaseConfig) {
      await signOut();
      setIsSignedIn(false);
      setUserEmail('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Profile" subtitle="Your account & statistics" />

        {/* Profile Header */}
        <ProfileSection title="Account" style={styles.accountSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{localProfile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{localProfile.name}</Text>
              <Text style={styles.profileHandle}>{localProfile.handle}</Text>
              {localProfile.bio ? (
                <Text style={styles.profileBio} numberOfLines={2}>{localProfile.bio}</Text>
              ) : null}
              <Text style={styles.profileStatus}>
                {isSignedIn ? `Signed in (${userEmail})` : 'Private device journal'}
              </Text>
            </View>
          </View>

          <ProfileDivider />
          <ProfileRow
            label="Edit profile"
            value="Name, handle, bio"
            icon="pencil"
            onPress={() => setEditModalVisible(true)}
          />

          {isSignedIn ? (
            <>
              <ProfileDivider />
              <ProfileRow label="Email" value={userEmail} icon="envelope" />
              <ProfileDivider />
              <ProfileRow label="Sign out" value="" icon="door" onPress={handleSignOut} destructive />
            </>
          ) : hasSupabaseConfig ? (
            <>
              <ProfileDivider />
              <ProfileRow
                label="Connect Cloud Account"
                value="Sign in to sync with classmates"
                icon="cloud"
                onPress={() => router.push('/(auth)/login')}
              />
            </>
          ) : (
            <>
              <ProfileDivider />
              <ProfileRow label="Storage Mode" value="Private Local Journal" icon="padlock" />
            </>
          )}
        </ProfileSection>

        {/* Stats */}
        {isLoading ? (
          <>
            <SkeletonProfileHeader />
            <SkeletonSettingsSection rows={6} />
          </>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{photoCount}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{favoriteCount}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{streak > 0 ? `${streak}🔥` : '0'}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontSize: 14 }]} numberOfLines={1}>
                {mostActiveMonth ? mostActiveMonth.split(' ')[0] : '—'}
              </Text>
              <Text style={styles.statLabel}>Best Month</Text>
            </View>
          </View>
        )}

        {/* Navigation */}
        <ProfileSection title="Your Library">
          <ProfileRow
            label="All memories"
            value={`${photoCount} total`}
            icon="calendar"
            onPress={() => router.push('/(tabs)/memories')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Favorites"
            value={`${favoriteCount} memories`}
            icon="star"
            onPress={() => router.push('/favorites')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Collections"
            value="Organized groups"
            icon="file"
            onPress={() => router.push('/collections')}
          />
        </ProfileSection>

        {/* Settings & Data */}
        <ProfileSection title="Settings & Data">
          <ProfileRow
            label="Settings"
            value="Theme, shortcuts, export"
            icon="cog"
            onPress={() => router.push('/settings')}
          />
          <ProfileDivider />
          <ProfileRow
            label="Privacy guarantee"
            value="No public profiles, no tracking"
            icon="info"
          />
        </ProfileSection>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.modalInput}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Display name"
            />

            <Text style={styles.fieldLabel}>Handle</Text>
            <TextInput
              value={editHandle}
              onChangeText={setEditHandle}
              style={styles.modalInput}
              placeholder="@handle"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              accessibilityLabel="Handle"
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              style={[styles.modalInput, styles.bioInput]}
              placeholder="A few words about you…"
              placeholderTextColor={colors.textMuted}
              multiline
              accessibilityLabel="Bio"
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="secondary" onPress={() => setEditModalVisible(false)} />
              <Button title="Save Changes" variant="accent" onPress={handleSaveProfile} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  accountSection: {
    marginTop: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    borderWidth: borders.thin,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    ...typography.serif.title2,
    color: colors.accent,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  profileHandle: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  profileBio: {
    ...typography.sans.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  profileStatus: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 8, 12, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
  },
  bioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
