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
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { DoubleTapPhoto } from '@/components/ui/DoubleTapPhoto';
import { useToast } from '@/components/ui/Toast';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { useClass } from '@/hooks/useClass';
import { supabase } from '@/lib/supabase/client';
import { getBackendUrl, postMemoryToCircle, fetchWithTimeout } from '@/lib/photo-upload';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';

type CircleViewMode = 'list' | 'details';
type CircleTab = 'Memories' | 'Members' | 'Events';

export default function CircleScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);
  const { showToast } = useToast();

  const { activeCircle, circles, selectCircle, refreshCircles } = useUnifiedCircle();
  const { classes, activeClass, refreshClasses } = useClass();

  const [viewMode, setViewMode] = useState<CircleViewMode>('details');
  const [activeTab, setActiveTab] = useState<CircleTab>('Memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedPosts, setSharedPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In-Circle Upload
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const currentCircle = activeCircle || {
    id: activeClass?.id || 'circle-1',
    name: activeClass?.name || 'Cyber Security 2026',
    memberCount: activeClass?.member_count || 24,
    description: 'Our class circle for Cyber Security 2026. Share, connect and make memories!',
  };

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      if (currentCircle?.id && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const backendUrl = getBackendUrl();
          const response = await fetchWithTimeout(
            `${backendUrl}/api/classes/${currentCircle.id}/feed`,
            {
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
              },
            },
            2500,
          );
          if (response.ok) {
            const feedData = await response.json();
            const serverPosts = (feedData.posts || []).map((p: any) => ({
              id: p.id,
              uri: p.photoUrl || p.photo_path,
              caption: p.caption || '',
              authorName: p.authorName || 'Classmate',
              authorAvatar: p.authorAvatar || null,
              category: 'General' as const,
              createdAt: p.created_at || new Date().toISOString(),
              reactions: p.reactionsMap || {},
              userReaction: p.userReaction || null,
              commentCount: Array.isArray(p.comments) ? p.comments.length : (p.comment_count ?? 0),
            }));
            setSharedPosts(serverPosts);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback local posts
      const local = await getLocalPhotoPosts();
      setSharedPosts(local);
    } catch {
      const local = await getLocalPhotoPosts();
      setSharedPosts(local);
    } finally {
      setIsLoading(false);
    }
  }, [currentCircle?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshCircles();
      refreshClasses();
      loadFeed();
    }, [refreshCircles, refreshClasses, loadFeed])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCircles();
    await refreshClasses();
    await loadFeed();
    setIsRefreshing(false);
  };

  const handlePickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        setSelectedPhotoUri(res.assets[0].uri);
        setUploadModalVisible(true);
      }
    } catch {}
  };

  const handleUploadSubmit = async () => {
    if (!selectedPhotoUri) return;
    setIsUploading(true);
    try {
      await postMemoryToCircle(currentCircle.id, selectedPhotoUri, uploadCaption.trim());
      showToast({ message: 'Memory shared with circle!', variant: 'success' });
      setUploadModalVisible(false);
      setSelectedPhotoUri(null);
      setUploadCaption('');
      await loadFeed();
    } catch {
      showToast({ message: 'Upload failed. Try again.', variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Combine circles list for Screen 7
  const displayCircles = circles.length > 0 ? circles : [
    { id: 'cs-2026', name: 'Cyber Security 2026', memberCount: 24, isDefault: true },
    { id: 'tech-enthusiasts', name: 'Tech Enthusiasts', memberCount: 16, isDefault: false },
    { id: 'friends-forever', name: 'Friends Forever', memberCount: 12, isDefault: false },
    { id: 'college-buddies', name: 'College Buddies', memberCount: 20, isDefault: false },
  ];

  const filteredCircles = displayCircles.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // ==========================================
  // VIEW 1: CIRCLES LIST SCREEN (Screen 7)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setViewMode('details')}
            style={styles.backButton}
            hitSlop={12}
          >
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Circles</Text>
          <Pressable
            style={styles.rightIconBtn}
            onPress={() => router.push('/(onboarding)/join-class')}
            hitSlop={8}
          >
            <Icon name="users" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {/* Search Input */}
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search circles..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Circles List */}
          <View style={styles.circlesList}>
            {filteredCircles.map((circle) => {
              const isSelected = circle.id === currentCircle.id || (circle as any).isDefault;
              return (
                <Pressable
                  key={circle.id}
                  style={styles.circleItemCard}
                  onPress={() => {
                    selectCircle(circle.id);
                    setViewMode('details');
                  }}
                  accessibilityRole="button"
                >
                  <View style={styles.circleItemAvatar}>
                    <Avatar name={circle.name} size={44} ring={isSelected} />
                  </View>

                  <View style={styles.circleItemDetails}>
                    <Text style={styles.circleItemName}>{circle.name}</Text>
                    <Text style={styles.circleItemMembers}>
                      {circle.memberCount} members
                    </Text>
                  </View>

                  {/* Active / Checked indicator */}
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Icon name="heart" size={14} color={colors.crust} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Bottom Create Circle Button */}
          <Pressable
            style={styles.createCircleBtn}
            onPress={() => router.push('/(onboarding)/create-class')}
            accessibilityRole="button"
          >
            <Text style={styles.createCircleBtnText}>Create Circle</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: CIRCLE DETAILS SCREEN (Screen 8)
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Cover Photo Header with < and ... actions */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri:
                sharedPosts[0]?.uri ||
                'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop',
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />

          {/* Header navigation over cover photo */}
          <View style={styles.coverHeaderRow}>
            <Pressable
              onPress={() => setViewMode('list')}
              style={styles.coverNavBtn}
              hitSlop={12}
            >
              <Icon name="arrow-left" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => {
                if (activeClass?.join_code) {
                  Clipboard.setString(activeClass.join_code);
                  showToast({ message: `Invite code "${activeClass.join_code}" copied!`, variant: 'success' });
                } else {
                  showToast({ message: 'Cyber Security 2026 circle active', variant: 'default' });
                }
              }}
              style={styles.coverNavBtn}
              hitSlop={12}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>⋯</Text>
            </Pressable>
          </View>
        </View>

        {/* Circle Meta Section */}
        <View style={styles.circleInfoSection}>
          <Text style={styles.detailsTitle}>{currentCircle.name}</Text>
          <Text style={styles.detailsMembersCount}>{currentCircle.memberCount} members</Text>

          {/* Member Avatars Stack */}
          <View style={styles.avatarStackRow}>
            {['Sarah', 'Alex', 'Priya', 'David'].map((name, i) => (
              <View
                key={name}
                style={[
                  styles.stackedAvatarWrap,
                  { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i },
                ]}
              >
                <Avatar name={name} size={30} ring />
              </View>
            ))}
            <View
              style={[
                styles.stackedAvatarWrap,
                styles.overflowAvatarWrap,
                { marginLeft: -10, zIndex: 5 },
              ]}
            >
              <Text style={styles.overflowText}>+18</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.descriptionText}>
            Our class circle for Cyber Security 2026. Share, connect and make memories!
          </Text>

          {/* Upload Memory Button */}
          <Pressable
            style={styles.uploadMemoryBtn}
            onPress={handlePickPhoto}
            accessibilityRole="button"
          >
            <Icon name="picture" size={18} color={colors.accent} />
            <Text style={styles.uploadMemoryBtnText}>Upload Memory</Text>
          </Pressable>
        </View>

        {/* Segmented Tabs: Memories | Members | Events */}
        <View style={styles.segmentedTabs}>
          {(['Memories', 'Members', 'Events'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.segmentedTab, isActive && styles.segmentedTabActive]}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    isActive && styles.segmentedTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === 'Memories' && (
          <View style={styles.memoriesFeedSection}>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
            ) : sharedPosts.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>No memories shared yet.</Text>
                <Pressable onPress={handlePickPhoto} style={styles.firstPhotoBtn}>
                  <Text style={styles.firstPhotoBtnText}>Be the first to post!</Text>
                </Pressable>
              </View>
            ) : (
              sharedPosts.map((post) => (
                <View key={post.id} style={styles.feedCard}>
                  {/* Author Row */}
                  <View style={styles.feedAuthorRow}>
                    <Avatar name={post.authorName || 'Sarah'} size={38} ring photoUri={post.authorAvatar || undefined} />
                    <View style={styles.feedAuthorInfo}>
                      <Text style={styles.feedAuthorName}>{post.authorName || 'Sarah'}</Text>
                      <Text style={styles.feedTimestamp}>2h ago</Text>
                    </View>
                    <Text style={styles.optionsDot}>⋯</Text>
                  </View>

                  {/* Caption */}
                  {post.caption ? (
                    <Text style={styles.feedCaption}>{post.caption}</Text>
                  ) : null}

                  {/* Large Photo with Instagram-inspired Double-Tap Heart Burst */}
                  <DoubleTapPhoto
                    uri={post.uri}
                    style={styles.feedImage}
                    borderRadius={radius.lg}
                    onSingleTap={() => router.push(`/post/${post.id}`)}
                    onDoubleTap={() => handleToggleLike(post.id)}
                  />

                  {/* Actions Row */}
                  <View style={styles.feedActionsRow}>
                    <Pressable
                      style={styles.feedActionItem}
                      onPress={() => handleToggleLike(post.id)}
                      hitSlop={8}
                    >
                      <Icon
                        name="heart"
                        size={18}
                        color={likedPosts[post.id] ? colors.accent : colors.error}
                      />
                      <Text
                        style={[
                          styles.feedActionCount,
                          likedPosts[post.id] && { color: colors.accent, fontWeight: '700' },
                        ]}
                      >
                        {likedPosts[post.id] ? 125 : 124}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.feedActionItem}
                      onPress={() => router.push(`/post/${post.id}`)}
                      hitSlop={8}
                    >
                      <Icon name="picture" size={18} color={colors.textSecondary} />
                      <Text style={styles.feedActionCount}>{post.commentCount || 12}</Text>
                    </Pressable>
                    <View style={{ flex: 1 }} />
                    <Icon name="bookmark" size={18} color={colors.textSecondary} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Members' && (
          <View style={styles.membersSection}>
            {['Sarah Jenkins', 'Alex Rivera', 'Priya Patel', 'David Chen', 'Maria Gomez', 'You'].map(
              (name) => (
                <View key={name} style={styles.memberListItem}>
                  <Avatar name={name} size={40} />
                  <View style={styles.memberListInfo}>
                    <Text style={styles.memberListName}>{name}</Text>
                    <Text style={styles.memberListRole}>Classmate</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.textMuted} />
                </View>
              )
            )}
          </View>
        )}

        {activeTab === 'Events' && (
          <View style={styles.eventsSection}>
            <View style={styles.eventCard}>
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateMonth}>DEC</Text>
                <Text style={styles.eventDateDay}>15</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>Class Graduation Photoshoot</Text>
                <Text style={styles.eventSubtitle}>Main Quad • 2:00 PM</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
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
              <Text style={styles.modalTitle}>Upload to {currentCircle.name}</Text>
              <Pressable onPress={() => setUploadModalVisible(false)} hitSlop={12}>
                <Icon name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {selectedPhotoUri && (
              <Image
                source={{ uri: selectedPhotoUri }}
                style={styles.modalImagePreview}
                resizeMode="cover"
              />
            )}

            <TextInput
              value={uploadCaption}
              onChangeText={setUploadCaption}
              placeholder="Add a caption..."
              placeholderTextColor={colors.textMuted}
              style={styles.modalTextInput}
              multiline
            />

            <Pressable
              style={styles.modalSubmitBtn}
              onPress={handleUploadSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.crust} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Share to Circle</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    backButton: {
      padding: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    rightIconBtn: {
      padding: 6,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      minHeight: 46,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
    },
    circlesList: {
      gap: 12,
    },
    circleItemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 14,
    },
    circleItemAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleItemDetails: {
      flex: 1,
      gap: 3,
    },
    circleItemName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    circleItemMembers: {
      fontSize: 13,
      color: colors.textMuted,
    },
    checkBadge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createCircleBtn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 20px rgba(180, 190, 254, 0.3)'
              : '0 6px 20px rgba(114, 135, 253, 0.25)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    createCircleBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.crust,
    },

    // Details View Styles
    detailsContent: {
      paddingBottom: 100,
    },
    coverContainer: {
      width: '100%',
      height: 190,
      position: 'relative',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    coverOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    coverHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    coverNavBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleInfoSection: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 10,
    },
    detailsTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.4,
    },
    detailsMembersCount: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    avatarStackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    stackedAvatarWrap: {
      borderWidth: 2,
      borderColor: colors.background,
      borderRadius: 999,
    },
    overflowAvatarWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: isDark ? colors.surface1 : colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overflowText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    uploadMemoryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? colors.surface0 : colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      marginTop: 4,
    },
    uploadMemoryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
    },
    segmentedTabs: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 12,
      backgroundColor: isDark ? colors.surface0 : colors.backgroundSecondary,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    segmentedTab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    segmentedTabActive: {
      backgroundColor: colors.card,
    },
    segmentedTabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    segmentedTabTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    memoriesFeedSection: {
      paddingHorizontal: 20,
      gap: 20,
    },
    emptyFeed: {
      paddingVertical: 40,
      alignItems: 'center',
      gap: 12,
    },
    emptyFeedText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    firstPhotoBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.accent,
    },
    firstPhotoBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.crust,
    },
    feedCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 12,
    },
    feedAuthorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    feedAuthorInfo: {
      flex: 1,
    },
    feedAuthorName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    feedTimestamp: {
      fontSize: 11,
      color: colors.textMuted,
    },
    optionsDot: {
      fontSize: 18,
      color: colors.textMuted,
    },
    feedCaption: {
      fontSize: 14,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    feedImage: {
      width: '100%',
      height: 220,
      borderRadius: 14,
    },
    feedActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingTop: 4,
    },
    feedActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    feedActionCount: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    membersSection: {
      paddingHorizontal: 20,
      gap: 10,
    },
    memberListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    memberListInfo: {
      flex: 1,
    },
    memberListName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    memberListRole: {
      fontSize: 12,
      color: colors.textMuted,
    },
    eventsSection: {
      paddingHorizontal: 20,
      gap: 12,
    },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 14,
    },
    eventDateBadge: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? colors.surface1 : colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventDateMonth: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.accent,
    },
    eventDateDay: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    eventSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      gap: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    modalImagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 14,
    },
    modalTextInput: {
      backgroundColor: isDark ? colors.surface1 : colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      fontSize: 15,
      color: colors.textPrimary,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalSubmitBtn: {
      height: 50,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSubmitBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.crust,
    },
  });
}
