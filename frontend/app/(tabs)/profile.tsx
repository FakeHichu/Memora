<<<<<<< HEAD
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { radius, spacing, typography, type ThemeColors, type ThemeMode } from '@/constants/theme';
import { clearLocalPhotoPosts, getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/providers/ThemeProvider';

type ProfileTab = 'Posts' | 'Memories' | 'Tagged';

export default function ProfileScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Posts');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editingVisible, setEditingVisible] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.display_name;
  const displayName = typeof metadataName === 'string'
    ? metadataName
    : session?.user.email?.split('@')[0] ?? 'Your Memora';
  const username = session?.user.email?.split('@')[0] ?? 'your-moments';

  const refreshPhotos = useCallback(() => {
    getLocalPhotoPosts()
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  useFocusEffect(refreshPhotos);

  const saveProfileName = async () => {
    if (!supabase || !session || !draftName.trim()) return;
    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ data: { display_name: draftName.trim() } });
    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setEditingVisible(false);
    setIsSaving(false);
  };

  const deletePhotos = async () => {
    try {
      await clearLocalPhotoPosts();
      setPosts([]);
      setConfirmingDelete(false);
      setMessage('Local photos were deleted from this device.');
    } catch {
      setMessage('Could not delete the photos saved on this device.');
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    setSettingsVisible(false);
    router.replace('/(auth)/login');
  };

  const shareProfile = async () => {
    try {
      await Share.share({ message: `${displayName} keeps moments with Memora.` });
    } catch {
      setMessage('Profile sharing is not available on this device.');
=======
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
>>>>>>> origin/swish
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.wordmark}>MEMORA</Text>
            <Text style={styles.topTitle}>Your profile</Text>
          </View>
          <Pressable style={styles.settingsButton} onPress={() => { setMessage(null); setSettingsVisible(true); }} accessibilityRole="button" accessibilityLabel="Open settings">
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <Avatar name={displayName} size={88} tint={colors.secondary} />
          <View style={styles.profileIdentity}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.bio}>Collecting the small things, keeping them close.</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <ProfileStat label="Memories" value={posts.length} />
          <View style={styles.statDivider} />
          <ProfileStat label="Photos" value={posts.length} />
          <View style={styles.statDivider} />
          <ProfileStat label="Friends" value="—" />
        </View>
        <Text style={styles.statNote}>Friend connections appear when private social features are connected.</Text>

        <View style={styles.profileActions}>
          <Pressable
            style={[styles.profileAction, !session && styles.profileActionDisabled]}
            onPress={() => {
              if (!session) return;
              setDraftName(displayName);
              setMessage(null);
              setEditingVisible(true);
            }}
            disabled={!session}
            accessibilityRole="button"
            accessibilityLabel="Edit profile name"
            accessibilityHint={session ? undefined : 'Sign in to edit your profile'}
          >
            <Text style={styles.profileActionText}>Edit profile</Text>
          </Pressable>
          <Pressable style={styles.profileAction} onPress={shareProfile} accessibilityRole="button" accessibilityLabel="Share profile">
            <Text style={styles.profileActionText}>Share profile</Text>
          </Pressable>
        </View>

        <Pressable style={styles.yearbookLink} onPress={() => router.push('/(tabs)/yearbook')} accessibilityRole="button" accessibilityLabel="Open your yearbook">
          <View style={styles.yearbookMark}><Text style={styles.yearbookMarkText}>M</Text></View>
          <View style={styles.yearbookCopy}>
            <Text style={styles.yearbookTitle}>My Yearbook</Text>
            <Text style={styles.yearbookMeta}>A life in little moments</Text>
          </View>
          <Text style={styles.yearbookArrow}>›</Text>
        </Pressable>

        <View style={styles.tabs}>
          {(['Posts', 'Memories', 'Tagged'] as const).map((tab) => (
            <Pressable key={tab} style={styles.profileTab} onPress={() => setActiveTab(tab)} accessibilityRole="button" accessibilityState={{ selected: activeTab === tab }}>
              <Text style={[styles.profileTabText, activeTab === tab && styles.profileTabTextActive]}>{tab}</Text>
              {activeTab === tab ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        {activeTab === 'Tagged' ? (
          <View style={styles.tabEmpty}>
            <Text style={styles.tabEmptyTitle}>Nothing tagged yet</Text>
            <Text style={styles.tabEmptyText}>Tagged memories will appear when people and class sharing are connected.</Text>
          </View>
        ) : posts.length ? (
          <View style={styles.photoGrid}>
            {posts.map((post) => (
              <Pressable key={post.id} style={styles.photoTile} onPress={() => router.push(`/post/${post.id}`)} accessibilityRole="button" accessibilityLabel={`Open memory: ${post.caption || 'A moment from today'}`}>
                <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel={post.caption || 'Saved memory'} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.tabEmpty}>
            <Text style={styles.tabEmptyTitle}>Your collection begins here</Text>
            <Text style={styles.tabEmptyText}>Photos you capture are private and saved on this device.</Text>
            <Pressable style={styles.captureAction} onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Capture a memory">
              <Text style={styles.captureActionText}>Capture a memory  ↗</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={settingsVisible} animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSettingsVisible(false)} accessibilityRole="button" accessibilityLabel="Close settings" />
          <View style={styles.settingsSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeading}>
              <Text style={styles.sheetTitle}>Settings</Text>
              <Pressable onPress={() => setSettingsVisible(false)} style={styles.sheetClose} accessibilityRole="button" accessibilityLabel="Close settings"><Text style={styles.sheetCloseText}>×</Text></Pressable>
            </View>

            <View style={styles.storageSection}>
              <Text style={styles.storageEyebrow}>PRIVATE STORAGE</Text>
              <Text style={styles.storageTitle}>{posts.length} {posts.length === 1 ? 'photo' : 'photos'} saved on this device</Text>
              <Text style={styles.storageText}>These images are local to this device and are not uploaded or shared.</Text>
            </View>

            <View style={styles.appearanceSection}>
              <View style={styles.appearanceHeading}>
                <View style={styles.appearanceCopy}>
                  <Text style={styles.appearanceTitle}>Appearance</Text>
                  <Text style={styles.appearanceSubtitle}>Choose your Memora theme</Text>
                </View>
                <Text style={styles.appearanceValue}>{mode === 'dark' ? 'Dark' : 'Light'}</Text>
              </View>
              <View style={styles.appearanceOptions} accessibilityLabel="App appearance">
                {([
                  { value: 'dark', label: 'Dark', icon: '☾' },
                  { value: 'light', label: 'Light', icon: '☼' },
                ] as const).map((option) => (
                  <Pressable
                    key={option.value}
                    style={[styles.appearanceOption, mode === option.value && styles.appearanceOptionSelected]}
                    onPress={() => setMode(option.value as ThemeMode)}
                    accessibilityRole="button"
                    accessibilityLabel={`${option.label} theme`}
                    accessibilityState={{ selected: mode === option.value }}
                  >
                    <Text style={[styles.appearanceIcon, mode === option.value && styles.appearanceIconSelected]}>{option.icon}</Text>
                    <Text style={[styles.appearanceOptionText, mode === option.value && styles.appearanceOptionTextSelected]}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {confirmingDelete ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Delete every local photo?</Text>
                <Text style={styles.confirmText}>This can’t be undone. Shared class photos are not affected.</Text>
                <View style={styles.confirmActions}>
                  <Pressable style={styles.cancelButton} onPress={() => setConfirmingDelete(false)} accessibilityRole="button" accessibilityLabel="Cancel photo deletion"><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
                  <Pressable style={styles.deleteButton} onPress={deletePhotos} accessibilityRole="button" accessibilityLabel="Confirm delete all local photos"><Text style={styles.deleteButtonText}>Delete photos</Text></Pressable>
                </View>
              </View>
            ) : posts.length ? (
              <Pressable style={styles.settingRow} onPress={() => setConfirmingDelete(true)} accessibilityRole="button" accessibilityLabel="Delete all photos saved on this device">
                <Text style={styles.settingRowLabel}>Delete local photos</Text>
                <Text style={styles.settingArrow}>›</Text>
              </Pressable>
            ) : null}

            {hasSupabaseConfig && session ? (
              <Pressable style={styles.signOutButton} onPress={handleSignOut} accessibilityRole="button" accessibilityLabel="Sign out">
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            ) : (
              <Text style={styles.localModeNote}>You’re using Memora’s private, device-only journal.</Text>
            )}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </Modal>

      <Modal transparent visible={editingVisible} animationType="slide" onRequestClose={() => setEditingVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditingVisible(false)} accessibilityRole="button" accessibilityLabel="Close profile editor" />
          <View style={styles.settingsSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit profile</Text>
            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput value={draftName} onChangeText={setDraftName} style={styles.nameInput} maxLength={60} returnKeyType="done" accessibilityLabel="Display name" />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Pressable style={styles.saveButton} onPress={saveProfileName} disabled={isSaving || !draftName.trim()} accessibilityRole="button" accessibilityLabel="Save profile name">
              <Text style={styles.saveButtonText}>{isSaving ? 'Saving…' : 'Save changes'}</Text>
            </Pressable>
=======
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
>>>>>>> origin/swish
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
function ProfileStat({ label, value }: { label: string; value: number | string }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  topBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  topTitle: { ...typography.heading, color: colors.text, marginTop: 2 },
  settingsButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surface },
  settingsIcon: { color: colors.text, fontSize: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  profileIdentity: { flex: 1, minWidth: 0, gap: 3 },
  displayName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  username: { color: colors.muted, fontSize: 12 },
  bio: { maxWidth: 250, color: colors.text, fontSize: 12, lineHeight: 17, marginTop: spacing.xs },
  statsRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 10 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  statNote: { marginTop: -spacing.md, color: colors.muted, fontSize: 9, textAlign: 'center' },
  profileActions: { flexDirection: 'row', gap: spacing.sm },
  profileAction: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.surface },
  profileActionDisabled: { opacity: 0.56 },
  profileActionText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  yearbookLink: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.glass },
  yearbookMark: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: colors.primary },
  yearbookMarkText: { color: colors.onPrimary, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  yearbookCopy: { flex: 1, gap: 3 },
  yearbookTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  yearbookMeta: { color: colors.muted, fontSize: 10 },
  yearbookArrow: { color: colors.primaryDark, fontSize: 24 },
  tabs: { minHeight: 45, flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border },
  profileTab: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  profileTabText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  profileTabTextActive: { color: colors.primaryDark, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: -1, width: 34, height: 2, borderRadius: 1, backgroundColor: colors.primaryDark },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  photoTile: { width: '32.5%', aspectRatio: 1, backgroundColor: colors.surface },
  photo: { width: '100%', height: '100%' },
  tabEmpty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  tabEmptyTitle: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  tabEmptyText: { maxWidth: 290, color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  captureAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  captureActionText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(18,16,14,0.42)' },
  settingsSheet: { gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, backgroundColor: colors.background },
  sheetHandle: { width: 36, height: 4, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.border },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { ...typography.subheading, color: colors.text },
  sheetClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sheetCloseText: { color: colors.text, fontSize: 28 },
  storageSection: { gap: spacing.xs, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  storageEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  storageTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  storageText: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  appearanceSection: { gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.glass },
  appearanceHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  appearanceCopy: { flex: 1, gap: 2 },
  appearanceTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  appearanceSubtitle: { color: colors.muted, fontSize: 10 },
  appearanceValue: { color: colors.primaryDark, fontSize: 10, fontWeight: '700' },
  appearanceOptions: { flexDirection: 'row', gap: spacing.sm },
  appearanceOption: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.glassStrong },
  appearanceOptionSelected: { borderColor: colors.accent, backgroundColor: colors.primarySoft },
  appearanceIcon: { color: colors.muted, fontSize: 17 },
  appearanceIconSelected: { color: colors.primaryDark },
  appearanceOptionText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  appearanceOptionTextSelected: { color: colors.text, fontWeight: '700' },
  settingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingRowLabel: { color: colors.error, fontSize: 13, fontWeight: '600' },
  settingArrow: { color: colors.muted, fontSize: 22 },
  confirmBox: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  confirmTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  confirmText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xs },
  cancelButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.md },
  cancelButtonText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  deleteButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: colors.error },
  deleteButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  signOutButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  signOutText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  localModeNote: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  message: { color: colors.error, fontSize: 12, lineHeight: 17 },
  fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  nameInput: { minHeight: 48, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.card, color: colors.text, fontSize: 14 },
  saveButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primary, opacity: 1 },
  saveButtonText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
  });
}
=======
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
>>>>>>> origin/swish
