import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
import { useToast } from '@/components/ui/Toast';
import {
  getLocalPhotoPosts,
  hasPostedToday,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { supabase } from '@/lib/supabase/client';
import { useClass } from '@/hooks/useClass';
import { getBackendUrl, postMemoryToCircle } from '@/lib/photo-upload';

export default function CircleScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { showToast } = useToast();
  const { classes, activeClass, isLoading: isClassLoading, selectClass, refreshClasses } = useClass();
  const [sharedPosts, setSharedPosts] = useState<(LocalPhotoPost & { authorName?: string })[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userPostedToday, setUserPostedToday] = useState(false);

  // In-circle upload states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Direct In-Circle Camera capture
  const handleTakePhoto = async () => {
    try {
      setUploadError(null);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedPhotoUri(result.assets[0].uri);
        setUploadCaption('');
        setUploadModalVisible(true);
      }
    } catch {
      Alert.alert('Camera error', 'Could not access the camera.');
    }
  };

  // Direct In-Circle Gallery selection
  const handleChooseFromLibrary = async () => {
    try {
      setUploadError(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Photo library permission is required to select photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedPhotoUri(result.assets[0].uri);
        setUploadCaption('');
        setUploadModalVisible(true);
      }
    } catch {
      Alert.alert('Gallery error', 'Could not open photo library.');
    }
  };

  // Upload to this circle alone
  const handleUploadSubmit = async () => {
    if (!selectedPhotoUri || !activeClass?.id) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await postMemoryToCircle(
        activeClass.id,
        selectedPhotoUri,
        uploadCaption.trim(),
      );

      if (!result.ok) {
        setUploadError(result.message || 'Failed to upload photo to circle.');
        setIsUploading(false);
        return;
      }

      setUploadModalVisible(false);
      setSelectedPhotoUri(null);
      setUploadCaption('');
      showToast({
        message: `📸 Photo uploaded to ${activeClass.name}!`,
        variant: 'success',
        duration: 3000,
      });

      // Refresh the feed immediately so the newly uploaded photo appears in the circle
      await loadPosts();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
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
              message="Join an existing circle using an invite code, or create a brand new private group for your classmates or friends."
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
              {sharedPosts[0]?.uri ? (
                <Image
                  source={{ uri: sharedPosts[0].uri }}
                  style={styles.circleCoverImage}
                  resizeMode="cover"
                  accessibilityLabel={`${activeClass.name} cover photo`}
                />
              ) : null}
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
                  <Text style={styles.statLabel}>Circle Photos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{userPostedToday ? '🔥 Active' : 'Ready'}</Text>
                  <Text style={styles.statLabel}>Your Status</Text>
                </View>
              </View>
            </View>

            {/* In-Circle Upload Card: Directly upload inside this circle */}
            <View style={styles.circleUploadCard}>
              <View style={styles.circleUploadHeader}>
                <View style={styles.circleUploadIcon}>
                  <Icon name="camera" size={22} color={colors.accent} />
                </View>
                <View style={styles.circleUploadInfo}>
                  <Text style={styles.circleUploadTitle}>Upload to {activeClass.name}</Text>
                  <Text style={styles.circleUploadSubtitle}>
                    Photos are shared only with members in this circle
                  </Text>
                </View>
              </View>
              <View style={styles.circleUploadBtnRow}>
                <Pressable
                  onPress={handleTakePhoto}
                  style={styles.circleUploadBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Take a photo with camera"
                >
                  <Icon name="camera" size={18} color={colors.accent} />
                  <Text style={styles.circleUploadBtnText}>Take Photo</Text>
                </Pressable>
                <Pressable
                  onPress={handleChooseFromLibrary}
                  style={[styles.circleUploadBtn, styles.circleUploadBtnPrimary]}
                  accessibilityRole="button"
                  accessibilityLabel="Choose photo from gallery"
                >
                  <Icon name="picture" size={18} color="#FFFFFF" />
                  <Text style={[styles.circleUploadBtnText, styles.circleUploadBtnTextPrimary]}>
                    From Gallery
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Circle Memories Feed */}
            <SectionHeader
              title={`Memories in ${activeClass.name}`}
              subtitle={
                sharedPosts.length > 0
                  ? `${sharedPosts.length} photo${sharedPosts.length === 1 ? '' : 's'} shared by circle members`
                  : 'No photos uploaded yet in this circle'
              }
            />

            {isLoading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading circle memories…</Text>
              </View>
            ) : sharedPosts.length === 0 ? (
              <EmptyState
                title={`No photos in ${activeClass.name} yet`}
                message="Be the first one in your circle to upload a photo! It will be instantly visible to all members."
                variant="prompt"
                action={{
                  label: 'Take first photo',
                  onPress: handleTakePhoto,
                  variant: 'accent',
                }}
                secondaryAction={{
                  label: 'Choose from gallery',
                  onPress: handleChooseFromLibrary,
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
                    isBlurred={false}
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

      {/* In-Circle Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isUploading) setUploadModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Upload to Circle</Text>
                <Text style={styles.modalSubtitle}>
                  Sharing inside: <Text style={{ color: colors.accent, fontWeight: '700' }}>{activeClass?.name}</Text>
                </Text>
              </View>
              <Pressable
                onPress={() => !isUploading && setUploadModalVisible(false)}
                style={styles.modalCloseBtn}
                disabled={isUploading}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {/* Photo Preview */}
            {selectedPhotoUri && (
              <View style={styles.modalPreviewContainer}>
                <Image
                  source={{ uri: selectedPhotoUri }}
                  style={styles.modalPreviewImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Caption Input */}
            <View style={styles.modalInputWrap}>
              <TextInput
                value={uploadCaption}
                onChangeText={setUploadCaption}
                placeholder="Write a caption for your circle members..."
                placeholderTextColor={colors.textMuted}
                style={styles.modalTextInput}
                multiline
                maxLength={280}
                editable={!isUploading}
              />
            </View>

            {uploadError && (
              <Text style={styles.modalErrorText}>{uploadError}</Text>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Change Photo"
                variant="secondary"
                onPress={handleChooseFromLibrary}
                disabled={isUploading}
                style={{ flex: 1 }}
              />
              <Pressable
                onPress={handleUploadSubmit}
                disabled={isUploading}
                style={[styles.modalSubmitBtn, isUploading && styles.modalSubmitBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Upload photo to circle"
              >
                {isUploading ? (
                  <View style={styles.uploadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>Uploading…</Text>
                  </View>
                ) : (
                  <Text style={styles.modalSubmitText}>Share to Circle</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.xxl,
      borderWidth: borders.thin,
      borderColor: colors.border,
      overflow: 'hidden',
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
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingBottom: spacing.sm,
      borderBottomWidth: borders.hairline,
      borderBottomColor: colors.borderSoft,
    },
    circleCoverImage: {
      width: '100%',
      height: 136,
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
      marginHorizontal: spacing.lg,
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
      marginHorizontal: spacing.lg,
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
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
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
    circleUploadCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderColor: colors.accent,
      gap: spacing.md,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }),
    },
    circleUploadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    circleUploadIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.lg,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleUploadInfo: {
      flex: 1,
    },
    circleUploadTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    circleUploadSubtitle: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    circleUploadBtnRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    circleUploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.md,
      borderWidth: borders.hairline,
      borderColor: colors.borderDefault,
    },
    circleUploadBtnPrimary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    circleUploadBtnText: {
      ...typography.sans.bodyStrong,
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    circleUploadBtnTextPrimary: {
      color: '#FFFFFF',
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
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: spacing.xl,
      gap: spacing.md,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    modalTitle: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    modalSubtitle: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
    },
    modalPreviewContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      maxHeight: 280,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.backgroundSecondary,
      borderWidth: borders.hairline,
      borderColor: colors.borderDefault,
    },
    modalPreviewImage: {
      width: '100%',
      height: '100%',
    },
    modalInputWrap: {
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      padding: spacing.md,
    },
    modalTextInput: {
      color: colors.textPrimary,
      fontSize: 15,
      minHeight: 50,
      textAlignVertical: 'top',
    },
    modalErrorText: {
      ...typography.sans.caption,
      color: colors.error,
      textAlign: 'center',
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    modalSubmitBtn: {
      flex: 1.5,
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
    },
    modalSubmitBtnDisabled: {
      opacity: 0.6,
    },
    modalSubmitText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 16,
    },
    uploadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  });
}
