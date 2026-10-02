import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
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
  clearLocalPhotoPosts,
  getLocalPhotoPosts,
  getLocalProfile,
  saveLocalProfile,
  type LocalProfile,
} from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function ProfileScreen() {
  const [photoCount, setPhotoCount] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [localProfile, setLocalProfile] = useState<LocalProfile>({
    name: 'Class Memory Keeper',
    handle: '@memora_keeper',
    bio: 'Preserving everyday moments that matter.',
    email: '',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');

  const refreshProfileAndData = useCallback(() => {
    getLocalPhotoPosts().then((posts) => setPhotoCount(posts.length));
    getLocalProfile().then((prof) => {
      setLocalProfile(prof);
      setEditName(prof.name);
      setEditHandle(prof.handle);
      setEditBio(prof.bio);
    });

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

  const confirmClearPhotos = () => {
    Alert.alert(
      'Delete all photos?',
      'This permanently removes all photos saved in your journal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete photos',
          style: 'destructive',
          onPress: () => {
            clearLocalPhotoPosts().then(() => setPhotoCount(0));
          },
        },
      ],
    );
  };

  const handleSaveProfile = async () => {
    const updated = await saveLocalProfile({
      name: editName.trim() || 'Class Memory Keeper',
      handle: editHandle.trim() || '@memora_keeper',
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
        <AppHeader title="Profile" subtitle="Your account & settings" />

        {/* Account Card */}
        <ProfileSection title="Account" style={styles.accountSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{localProfile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{localProfile.name}</Text>
              <Text style={styles.profileHandle}>{localProfile.handle}</Text>
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
              <ProfileRow
                label="Sign out"
                value=""
                icon="door"
                onPress={handleSignOut}
                destructive
              />
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

        {/* Stats Section */}
        <ProfileSection title="Journal Statistics">
          <ProfileRow label="Memories captured" value={`${photoCount}`} icon="picture" />
          <ProfileDivider />
          <ProfileRow
            label="Active storage"
            value={isSignedIn ? 'Cloud + Local Cache' : 'Device Sandbox'}
            icon="file"
          />
        </ProfileSection>

        {/* Data & Privacy Section */}
        <ProfileSection title="Data & Safety">
          <ProfileRow
            label="Privacy guarantee"
            value="No public profiles, no tracking"
            icon="info"
          />
          <ProfileDivider />
          <ProfileRow
            label="Delete all local photos"
            value="Clear device storage"
            icon="trash"
            onPress={confirmClearPhotos}
            destructive
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
              placeholder="e.g. Maya Chen"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Handle</Text>
            <TextInput
              value={editHandle}
              onChangeText={setEditHandle}
              style={styles.modalInput}
              placeholder="e.g. @mayachen"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              style={[styles.modalInput, styles.bioInput]}
              placeholder="A few words about you..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setEditModalVisible(false)}
              />
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
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.serif.title2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  profileHandle: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  profileStatus: {
    ...typography.sans.caption,
    color: colors.textMuted,
    marginTop: 2,
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
  },
  modalTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
    marginBottom: spacing.md,
  },
  bioInput: {
    minHeight: 60,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});