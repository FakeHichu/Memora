import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Icon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { useCircleFeed } from '@/hooks/useCircleFeed';
import { uploadPhotoToCircle, type UploadProgress } from '@/lib/photo-upload-v2';
import { UploadProgressModal } from '@/components/circle/UploadProgressModal';
import { NewPostsBanner } from '@/components/circle/NewPostsBanner';
import { CircleSwitcher } from '@/components/circle/CircleSwitcher';
import { Avatar } from '@/components/ui/Avatar';

export default function CircleScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { showToast } = useToast();
  const { activeCircle, circles, selectCircle, refreshCircles } = useUnifiedCircle();
  const { posts, isLoading, refreshFeed, hasNewPosts, loadNewPosts } = useCircleFeed(
    activeCircle?.id || null
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Upload modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshCircles();
      refreshFeed();
    }, [refreshCircles, refreshFeed])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshCircles(), refreshFeed()]);
    setIsRefreshing(false);
  };

  const handleTakePhoto = async () => {
    try {
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

  const handleChooseFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Photo library permission is required.');
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

  const handleUploadSubmit = async () => {
    if (!selectedPhotoUri || !activeCircle?.id) return;

    setUploadModalVisible(false);
    setShowProgressModal(true);

    const result = await uploadPhotoToCircle(
      selectedPhotoUri,
      activeCircle.id,
      uploadCaption.trim(),
      (progress) => setUploadProgress(progress)
    );

    if (result.success) {
      setTimeout(() => {
        setShowProgressModal(false);
        setSelectedPhotoUri(null);
        setUploadCaption('');
        setUploadProgress(null);
        showToast({
          message: '📸 Photo shared with your Circle!',
          variant: 'success',
          duration: 3000,
        });
        refreshFeed();
      }, 1000);
    } else {
      setTimeout(() => {
        setShowProgressModal(false);
        setUploadProgress(null);
        Alert.alert('Upload Failed', result.error || 'Please try again');
      }, 1500);
    }
  };

  const handleReact = async (postId: string, emoji: string) => {
    // Reaction logic handled in MemoryCard
    console.log('React to post:', postId, emoji);
  };

  // Mock member data (replace with real API call)
  const mockMembers = Array.from({ length: Math.min(activeCircle?.memberCount || 0, 8) }).map(
    (_, i) => ({
      id: `member-${i}`,
      name: `Member ${i + 1}`,
    })
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      
      {/* New Posts Banner */}
      {hasNewPosts && (
        <NewPostsBanner
          visible={hasNewPosts}
          onPress={loadNewPosts}
          count={1}
        />
      )}

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
        <AppHeader title="Circle" subtitle={activeCircle ? `${activeCircle.name}` : 'Your class memories'} />

        {/* No Circle State */}
        {!activeCircle && !isLoading && (
          <View style={styles.noCircleContainer}>
            <EmptyState
              title="No Circle Joined Yet"
              message="Join an existing Circle or create one to start sharing memories with your classmates."
              variant="users"
              action={{
                label: 'Enter Invite Code',
                onPress: () => router.push('/(onboarding)/join-class'),
                variant: 'accent',
              }}
              secondaryAction={{
                label: 'Create a Circle',
                onPress: () => router.push('/(onboarding)/create-class'),
              }}
              style={styles.emptyState}
            />
          </View>
        )}

        {/* Active Circle */}
        {activeCircle && (
          <>
            {/* Circle Header Card */}
            <View style={styles.circleHeaderCard}>
              <View style={styles.circleHeaderTop}>
                <View style={styles.circleIconLarge}>
                  <Text style={styles.circleIconText}>
                    {activeCircle.name.slice(0, 2).toUpperCase()}
                  </Text>
                  <View style={styles.activeDot} />
                </View>

                <View style={styles.circleHeaderInfo}>
                  <View style={styles.activeLabel}>
                    <View style={styles.activeDotSmall} />
                    <Text style={styles.activeLabelText}>ACTIVE CIRCLE</Text>
                  </View>
                  <Text style={styles.circleHeaderName}>{activeCircle.name}</Text>
                  <Text style={styles.circleHeaderSchool}>
                    {activeCircle.schoolName || 'Your private class community'}
                  </Text>
                  {activeCircle.joinCode && (
                    <View style={styles.joinCodeBadge}>
                      <Icon name="share" size={10} color={colors.accent} />
                      <Text style={styles.joinCodeText}>Code: {activeCircle.joinCode}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Members Row */}
              {mockMembers.length > 0 && (
                <View style={styles.membersSection}>
                  <Text style={styles.membersLabel}>
                    {activeCircle.memberCount} MEMBER{activeCircle.memberCount === 1 ? '' : 'S'}
                  </Text>
                  <View style={styles.membersRow}>
                    {mockMembers.map((member) => (
                      <Avatar key={member.id} name={member.name} size={32} />
                    ))}
                    {activeCircle.memberCount > 8 && (
                      <View style={styles.moreMembersBadge}>
                        <Text style={styles.moreMembersText}>
                          +{activeCircle.memberCount - 8}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={handleTakePhoto}
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                >
                  <Icon name="camera" size={18} color={colors.accent} />
                  <Text style={styles.actionButtonTextSecondary}>Take Photo</Text>
                </Pressable>
                <Pressable
                  onPress={handleChooseFromLibrary}
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from gallery"
                >
                  <Icon name="picture" size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonTextPrimary}>From Gallery</Text>
                </Pressable>
              </View>
            </View>

            {/* Circle Switcher */}
            {circles.length > 1 && (
              <View style={styles.switcherContainer}>
                <CircleSwitcher
                  circles={circles}
                  activeCircleId={activeCircle.id}
                  onSelectCircle={selectCircle}
                  onJoinCircle={() => router.push('/(onboarding)/join-class')}
                />
              </View>
            )}

            {/* Circle Feed */}
            <View style={styles.feedSection}>
              <SectionHeader
                title="Circle Memories"
                subtitle={
                  posts.length > 0
                    ? `${posts.length} ${posts.length === 1 ? 'photo' : 'photos'} shared`
                    : 'No photos yet'
                }
              />

              {isLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={styles.loadingText}>Loading memories...</Text>
                </View>
              ) : posts.length === 0 ? (
                <EmptyState
                  title={`No photos in ${activeCircle.name} yet`}
                  message="Be the first to share a memory! Your photo will be visible to all Circle members."
                  variant="prompt"
                  action={{
                    label: 'Share First Photo',
                    onPress: handleTakePhoto,
                    variant: 'accent',
                  }}
                  secondaryAction={{
                    label: 'Choose from Gallery',
                    onPress: handleChooseFromLibrary,
                  }}
                  style={styles.emptyState}
                />
              ) : (
                <View style={styles.feedColumn}>
                  {posts.map((post) => (
                    <MemoryCard
                      key={post.id}
                      memory={post}
                      authorName={post.authorName}
                      density="editorial"
                      aspectRatio={4 / 5}
                      onPress={() => router.push(`/post/${post.id}`)}
                      showMemoryId={true}
                      showReactions={true}
                      onReact={(emoji) => handleReact(post.id, emoji)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share to Circle</Text>
              <Pressable
                onPress={() => setUploadModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {selectedPhotoUri && (
              <View style={styles.modalPreviewContainer}>
                <Image
                  source={{ uri: selectedPhotoUri }}
                  style={styles.modalPreviewImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.modalInputWrap}>
              <TextInput
                value={uploadCaption}
                onChangeText={setUploadCaption}
                placeholder="Write a caption..."
                placeholderTextColor={colors.textMuted}
                style={styles.modalTextInput}
                multiline
                maxLength={280}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Change Photo"
                variant="secondary"
                onPress={handleChooseFromLibrary}
                style={{ flex: 1 }}
              />
              <Button
                title="Share to Circle"
                variant="accent"
                onPress={handleUploadSubmit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Upload Progress Modal */}
      <UploadProgressModal visible={showProgressModal} progress={uploadProgress} />
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
    noCircleContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    circleHeaderCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1.5,
      borderColor: colors.accent,
      gap: spacing.md,
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
    circleHeaderTop: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    circleIconLarge: {
      position: 'relative',
      width: 64,
      height: 64,
      borderRadius: radius.lg,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleIconText: {
      ...typography.serif.title,
      color: colors.accent,
      fontWeight: '700',
    },
    activeDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.success,
      borderWidth: 3,
      borderColor: colors.surface,
    },
    circleHeaderInfo: {
      flex: 1,
      gap: 4,
    },
    activeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    activeDotSmall: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    activeLabelText: {
      ...typography.mono.micro,
      color: colors.textMuted,
      fontWeight: '800',
      letterSpacing: 1,
    },
    circleHeaderName: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    circleHeaderSchool: {
      ...typography.sans.caption,
      color: colors.textSecondary,
    },
    joinCodeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.sm,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginTop: 2,
    },
    joinCodeText: {
      ...typography.mono.micro,
      color: colors.accent,
      fontWeight: '700',
      fontSize: 10,
    },
    membersSection: {
      gap: spacing.xs,
    },
    membersLabel: {
      ...typography.mono.micro,
      color: colors.textMuted,
      fontWeight: '800',
      letterSpacing: 1,
    },
    membersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -8,
    },
    moreMembersBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 2,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreMembersText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 10,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    actionButtonSecondary: {
      backgroundColor: colors.backgroundElevated,
      borderWidth: borders.thin,
      borderColor: colors.borderDefault,
    },
    actionButtonPrimary: {
      backgroundColor: colors.accent,
    },
    actionButtonTextSecondary: {
      ...typography.sans.bodyStrong,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    actionButtonTextPrimary: {
      ...typography.sans.bodyStrong,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    switcherContainer: {
      marginBottom: spacing.xl,
    },
    feedSection: {
      marginBottom: spacing.xl,
    },
    feedColumn: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    loadingState: {
      paddingVertical: spacing.xxxl,
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      ...typography.sans.body,
      color: colors.textMuted,
    },
    emptyState: {
      marginHorizontal: spacing.lg,
      paddingVertical: spacing.xxl,
    },
    bottomSpacer: {
      height: 40,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseText: {
      fontSize: 24,
      color: colors.textSecondary,
    },
    modalPreviewContainer: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      aspectRatio: 4 / 5,
    },
    modalPreviewImage: {
      width: '100%',
      height: '100%',
    },
    modalInputWrap: {
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    modalTextInput: {
      ...typography.sans.body,
      color: colors.textPrimary,
      minHeight: 80,
      maxHeight: 120,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
  });
}
