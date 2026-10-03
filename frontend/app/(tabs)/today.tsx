import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { previewPosts, previewStories, type PreviewStory } from '@/lib/social-preview';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/providers/ThemeProvider';

const currentDate = new Date();
type HomeNotice = 'notifications' | 'messages';

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [localPhotoPosts, setLocalPhotoPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => new Set());
  const [activeStory, setActiveStory] = useState<PreviewStory | null>(null);
  const [activeNotice, setActiveNotice] = useState<HomeNotice | null>(null);
  const [showPreviewNote, setShowPreviewNote] = useState(false);
  const { session } = useAuth();
  const accountName = session?.user.user_metadata.display_name;
  const firstName = typeof accountName === 'string'
    ? accountName.split(' ')[0]
    : session?.user.email?.split('@')[0] ?? 'friend';

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getLocalPhotoPosts()
        .then((posts) => {
          if (isActive) setLocalPhotoPosts(posts);
        })
        .catch(() => {
          if (isActive) setLocalPhotoPosts([]);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const toggleLike = (postId: string) => {
    setLikedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const sharePreview = async (caption: string) => {
    try {
      await Share.share({ message: caption });
    } catch {
      setShowPreviewNote(true);
    }
  };

  const feedPosts = [
    ...localPhotoPosts.map((post) => ({
      id: post.id,
      name: firstName,
      className: 'Only on this device',
      age: new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      avatarUri: undefined,
      photoUri: post.uri,
      caption: post.caption || 'A moment from today.',
      location: '',
      likes: 0,
      comments: 0,
      isPreview: false,
    })),
    ...previewPosts.map((post) => ({ ...post, isPreview: true })),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>MEMORA</Text>
            <Text style={styles.tagline}>YOUR MOMENTS. YOUR PEOPLE.</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconButton} onPress={() => setActiveNotice('notifications')} accessibilityRole="button" accessibilityLabel="Open notifications">
              <Text style={styles.headerIcon}>◌</Text>
            </Pressable>
            <Pressable style={styles.headerIconButton} onPress={() => setActiveNotice('messages')} accessibilityRole="button" accessibilityLabel="Open messages">
              <Text style={styles.headerIcon}>✉</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Open your profile">
              <Avatar name={firstName} size={40} tint={colors.secondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.welcomeRow}>
          <View style={styles.welcomeCopy}>
            <Text style={styles.dateKicker}>{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
            <Text style={styles.welcomeTitle}>Good to see you, {firstName}.</Text>
          </View>
          <Pressable style={styles.searchButton} onPress={() => router.push('/(tabs)/discover')} accessibilityRole="button" accessibilityLabel="Discover memories and people">
            <Text style={styles.searchIcon}>⌕</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Moments</Text>
            <Text style={styles.sectionSubtitle}>Little things from your circle</Text>
          </View>
          <Pressable onPress={() => setShowPreviewNote(true)} accessibilityRole="button" accessibilityLabel="About sample Moments">
            <Text style={styles.sampleLabel}>SAMPLE</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyRail}>
          <Pressable style={styles.storyItem} onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Add your moment">
            <View style={styles.addStoryFrame}>
              {localPhotoPosts[0] ? <Image source={{ uri: localPhotoPosts[0].uri }} style={styles.storyImage} /> : <Avatar name={firstName} size={58} tint={colors.secondary} />}
              <View style={styles.addStoryButton}><Text style={styles.addStoryPlus}>+</Text></View>
            </View>
            <Text style={styles.storyName}>Your day</Text>
          </Pressable>
          {previewStories.map((story) => (
            <Pressable key={story.id} style={styles.storyItem} onPress={() => setActiveStory(story)} accessibilityRole="button" accessibilityLabel={`View sample Moment from ${story.name}`}>
              <Avatar name={story.name} size={66} photoUri={story.photoUri} ring />
              <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.feedHeading}>
          <View>
            <Text style={styles.sectionTitle}>For you</Text>
            <Text style={styles.sectionSubtitle}>A quiet corner for everyday memories</Text>
          </View>
          <Text style={styles.feedFilter}>LATEST  ⌄</Text>
        </View>

        {isLoading ? <Text style={styles.emptyMessage}>Gathering your memories…</Text> : null}
        {!isLoading && feedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEyebrow}>A LITTLE SPACE FOR TODAY</Text>
            <Text style={styles.emptyTitle}>Your first moment starts here.</Text>
            <Text style={styles.emptyMessage}>Take a photo and keep it private on this device.</Text>
            <Pressable style={styles.captureLink} onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Capture your first moment">
              <Text style={styles.captureLinkText}>Capture a moment  ↗</Text>
            </Pressable>
          </View>
        ) : null}

        {feedPosts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          return (
            <View key={post.id} style={styles.feedPost}>
              <View style={styles.postHeader}>
                <Avatar name={post.name} size={42} photoUri={post.avatarUri} tint={colors.secondary} />
                <View style={styles.postIdentity}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Text style={styles.postMeta}>{post.className}  ·  {post.age}</Text>
                </View>
                <Text style={styles.privateMark}>{post.isPreview ? 'SAMPLE' : 'PRIVATE'}</Text>
              </View>

              <Image source={{ uri: post.photoUri }} style={styles.postPhoto} resizeMode="cover" accessibilityLabel={`Memory shared by ${post.name}`} />

              {post.location ? <Text style={styles.locationLine}>⌖  {post.location}</Text> : null}
              <View style={styles.postActions}>
                <View style={styles.actionGroup}>
                  <Pressable onPress={() => toggleLike(post.id)} style={styles.actionButton} accessibilityRole="button" accessibilityLabel={isLiked ? 'Remove appreciation' : 'Appreciate moment'} accessibilityState={{ selected: isLiked }}>
                    <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>{isLiked ? '♥' : '♡'}</Text>
                    <Text style={styles.actionCount}>{post.likes + (isLiked ? 1 : 0)}</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowPreviewNote(true)} style={styles.actionButton} accessibilityRole="button" accessibilityLabel="View replies to this sample moment">
                    <Text style={styles.actionIcon}>○</Text>
                    <Text style={styles.actionCount}>{post.comments}</Text>
                  </Pressable>
                  {post.isPreview ? (
                    <Pressable onPress={() => sharePreview(post.caption)} style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Share sample moment">
                      <Text style={styles.actionIcon}>↗</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.memoryMark}>{post.isPreview ? 'MEMORY PREVIEW' : 'ON THIS DEVICE'}</Text>
              </View>
              <Text style={styles.caption}><Text style={styles.captionName}>{post.name}  </Text>{post.caption}</Text>
            </View>
          );
        })}

        <Pressable style={styles.yearbookStrip} onPress={() => router.push('/(tabs)/yearbook')} accessibilityRole="button" accessibilityLabel="Open your yearbook">
          <View>
            <Text style={styles.yearbookEyebrow}>KEEP THE GOOD PARTS</Text>
            <Text style={styles.yearbookTitle}>Your year, in moments.</Text>
            <Text style={styles.yearbookMeta}>{localPhotoPosts.length} private {localPhotoPosts.length === 1 ? 'memory' : 'memories'} so far</Text>
          </View>
          <Text style={styles.yearbookArrow}>↗</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={Boolean(activeStory)} animationType="fade" onRequestClose={() => setActiveStory(null)}>
        {activeStory ? (
          <View style={styles.storyViewer}>
            <Image source={{ uri: activeStory.photoUri }} style={styles.storyViewerImage} resizeMode="cover" accessibilityLabel={`Sample moment from ${activeStory.name}`} />
            <SafeAreaView style={styles.storyViewerOverlay}>
              <View style={styles.storyProgress}><View style={styles.storyProgressFill} /></View>
              <View style={styles.storyViewerHeader}>
                <Avatar name={activeStory.name} size={38} photoUri={activeStory.photoUri} />
                <Text style={styles.storyViewerName}>{activeStory.name}  ·  SAMPLE</Text>
                <Pressable onPress={() => setActiveStory(null)} style={styles.storyClose} accessibilityRole="button" accessibilityLabel="Close Moment"><Text style={styles.storyCloseText}>×</Text></Pressable>
              </View>
              <Text style={styles.storyViewerCaption}>A moment worth keeping.</Text>
            </SafeAreaView>
          </View>
        ) : null}
      </Modal>

      <Modal transparent visible={showPreviewNote} animationType="fade" onRequestClose={() => setShowPreviewNote(false)}>
        <Pressable style={styles.noteBackdrop} onPress={() => setShowPreviewNote(false)}>
          <View style={styles.noteSheet}>
            <View style={styles.noteHandle} />
            <Text style={styles.noteTitle}>Preview content</Text>
            <Text style={styles.noteText}>Sample people, moments, reactions, and replies are local UI previews. They are not shared and are not connected to a live social feed.</Text>
            <Pressable style={styles.noteButton} onPress={() => setShowPreviewNote(false)} accessibilityRole="button" accessibilityLabel="Close preview information">
              <Text style={styles.noteButtonText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={Boolean(activeNotice)} animationType="slide" onRequestClose={() => setActiveNotice(null)}>
        <View style={styles.noteBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveNotice(null)} accessibilityRole="button" accessibilityLabel="Close activity panel" />
          <View style={styles.noteSheet}>
            <View style={styles.noteHandle} />
            <Text style={styles.noteTitle}>{activeNotice === 'messages' ? 'Messages' : 'Notifications'}</Text>
            <Text style={styles.noteText}>
              {activeNotice === 'messages'
                ? 'Private conversations are not connected yet. Memora never creates fake message threads.'
                : 'Your activity will appear here when the notification service is connected to your account.'}
            </Text>
            <Pressable style={styles.noteButton} onPress={() => setActiveNotice(null)} accessibilityRole="button" accessibilityLabel="Close activity panel">
              <Text style={styles.noteButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.glass },
  headerIcon: { color: colors.text, fontSize: 18, lineHeight: 22 },
  wordmark: { color: colors.primaryDark, fontSize: 13, fontWeight: '800', letterSpacing: 2.1 },
  tagline: { marginTop: 3, color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.sm },
  welcomeCopy: { flex: 1, minWidth: 0 },
  dateKicker: { color: colors.primaryDark, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  welcomeTitle: { ...typography.heading, color: colors.text, marginTop: spacing.xs },
  searchButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surface },
  searchIcon: { color: colors.primaryDark, fontSize: 25, lineHeight: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.sm },
  sectionTitle: { ...typography.subheading, color: colors.text },
  sectionSubtitle: { marginTop: 2, color: colors.muted, fontSize: 11 },
  sampleLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  storyRail: { gap: spacing.md, paddingRight: spacing.lg },
  storyItem: { width: 68, alignItems: 'center', gap: spacing.xs },
  addStoryFrame: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 33, padding: 3 },
  storyImage: { width: 58, height: 58, borderRadius: 29 },
  addStoryButton: { position: 'absolute', right: -1, bottom: 0, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background, borderRadius: 11, backgroundColor: colors.primary },
  addStoryPlus: { color: colors.onPrimary, fontSize: 16, lineHeight: 18, fontWeight: '700' },
  storyName: { maxWidth: 68, color: colors.text, fontSize: 10, fontWeight: '600' },
  feedHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  feedFilter: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  emptyState: { paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, gap: spacing.sm },
  emptyEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  emptyTitle: { ...typography.subheading, color: colors.text },
  emptyMessage: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  captureLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: spacing.md },
  captureLinkText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  feedPost: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  postHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postIdentity: { flex: 1, minWidth: 0, gap: 2 },
  postName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  postMeta: { color: colors.muted, fontSize: 10 },
  privateMark: { color: colors.primaryDark, fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  postPhoto: { width: '100%', aspectRatio: 0.94, borderRadius: radius.md, backgroundColor: colors.surface },
  locationLine: { color: colors.muted, fontSize: 10, fontWeight: '500' },
  postActions: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  actionButton: { minWidth: 44, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionIcon: { color: colors.text, fontSize: 23, lineHeight: 26 },
  likedIcon: { color: colors.primary },
  actionCount: { color: colors.text, fontSize: 11, fontWeight: '600' },
  memoryMark: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  caption: { color: colors.text, fontSize: 13, lineHeight: 19 },
  captionName: { fontWeight: '700' },
  yearbookStrip: { minHeight: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  yearbookEyebrow: { color: colors.primaryDark, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  yearbookTitle: { marginTop: 4, color: colors.text, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  yearbookMeta: { marginTop: 5, color: colors.muted, fontSize: 10 },
  yearbookArrow: { color: colors.primaryDark, fontSize: 24 },
  storyViewer: { flex: 1, backgroundColor: colors.background },
  storyViewerImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  storyViewerOverlay: { ...StyleSheet.absoluteFill, paddingHorizontal: spacing.lg },
  storyProgress: { height: 2, marginTop: spacing.md, borderRadius: 1, backgroundColor: colors.border },
  storyProgressFill: { width: '54%', height: 2, borderRadius: 1, backgroundColor: colors.accent },
  storyViewerHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  storyViewerName: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' },
  storyClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  storyCloseText: { color: colors.text, fontSize: 28 },
  storyViewerCaption: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 56, color: colors.text, fontSize: 20, fontWeight: '600' },
  noteBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,18,16,0.4)' },
  noteSheet: { gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, backgroundColor: colors.background },
  noteHandle: { width: 36, height: 4, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.border },
  noteTitle: { ...typography.subheading, color: colors.text },
  noteText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  noteButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  noteButtonText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' },
  });
}
