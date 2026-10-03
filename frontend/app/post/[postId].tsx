import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

<<<<<<< HEAD
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { getLocalPhotoPost, type LocalPhotoPost } from '@/lib/photo-draft';
import { useAppTheme } from '@/providers/ThemeProvider';
=======
import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  deleteLocalPhotoPost,
  getLocalPhotoPost,
  getLocalPhotoPosts,
  toggleLocalPhotoReaction,
  updateLocalPhotoPost,
  toggleFavorite,
  togglePin,
  archivePost,
  unarchivePost,
  recordRecentlyViewed,
  addTagToPost,
  removeTagFromPost,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';
import { ReactionBar } from '@/components/ui/ReactionBar';
import { Button } from '@/components/ui/Button';
import { TagList } from '@/components/ui/TagBadge';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonPostDetail } from '@/components/ui/Skeleton';

function getRelatedMemories(post: LocalPhotoPost, allPosts: LocalPhotoPost[]): LocalPhotoPost[] {
  if (allPosts.length <= 1) return [];

  const postTags = new Set(post.tags || []);
  const postDate = new Date(post.createdAt);

  return allPosts
    .filter((p) => p.id !== post.id && !p.isArchived)
    .map((p) => {
      let score = 0;
      // Shared tags
      const sharedTags = (p.tags || []).filter((t) => postTags.has(t));
      score += sharedTags.length * 3;
      // Same category
      if (p.category && p.category === post.category && p.category !== 'General') score += 2;
      // Same collection
      if (p.collectionId && p.collectionId === post.collectionId) score += 4;
      // Close in time (within 7 days)
      const pDate = new Date(p.createdAt);
      const daysDiff = Math.abs(postDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 7) score += 1;
      return { post: p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ post: p }) => p);
}
>>>>>>> origin/swish

export default function PostDetailScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { showToast } = useToast();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [allPosts, setAllPosts] = useState<LocalPhotoPost[]>([]);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [headerOpacity] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0));

  const loadPost = useCallback(() => {
    if (!postId) return;

    Promise.all([getLocalPhotoPost(postId), getLocalPhotoPosts()]).then(
      ([savedPost, savedPosts]) => {
        if (savedPost) {
          setPost(savedPost);
          setEditedCaption(savedPost.caption);
          setEditedTitle(savedPost.title || '');
          // Record view
          recordRecentlyViewed(savedPost.id);
        }
        setAllPosts(savedPosts);
      },
    );
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [loadPost]),
  );

  const date = post ? new Date(post.createdAt) : null;
  const formattedDate = date?.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeString = date?.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const memoryId = post ? `MEMORY_${post.id.slice(-3).padStart(3, '0')}` : '';
  const relatedMemories = post ? getRelatedMemories(post, allPosts) : [];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.current.setValue(y);
  };

  useEffect(() => {
    const scrollYRef = scrollY.current;
    const listener = ({ value }: { value: number }) => {
      const opacityVal = Math.max(0, 1 - value / 100);
      headerOpacity.setValue(opacityVal);
    };
    const listenerId = scrollYRef.addListener(listener);
    return () => scrollYRef.removeListener(listenerId);
  }, [headerOpacity, scrollY]);

  const handleSaveCaption = async () => {
    if (!post) return;
    setIsSaving(true);
    try {
      const updated = await updateLocalPhotoPost(post.id, {
        caption: editedCaption.trim(),
        title: editedTitle.trim() || undefined,
      });
      if (updated) {
        setPost(updated);
        setIsEditing(false);
        showToast({ message: 'Memory updated', variant: 'success', duration: 1500 });
      }
    } catch {
      Alert.alert('Error', 'Could not update memory.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => setConfirmDelete(true);

  const doDelete = async () => {
    if (!post) return;
    const success = await deleteLocalPhotoPost(post.id);
    setConfirmDelete(false);
    if (success) {
      showToast({ message: 'Memory deleted', variant: 'default', duration: 1500 });
      router.back();
    } else {
      Alert.alert('Error', 'Could not delete the memory.');
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: post.caption
          ? `Memora Memory: "${post.caption}" (${formattedDate})`
          : `Memora Memory from ${formattedDate}`,
        url: post.uri,
      });
    } catch {
      // user dismissed
    }
  };

  const handleReact = async (emoji: string) => {
    if (!post) return;
    const updated = await toggleLocalPhotoReaction(post.id, emoji);
    if (updated) setPost(updated);
  };

  const handleToggleFavorite = async () => {
    if (!post) return;
    const updated = await toggleFavorite(post.id);
    if (updated) {
      setPost(updated);
      showToast({
        message: updated.isFavorite ? '⭐ Added to favorites' : 'Removed from favorites',
        variant: updated.isFavorite ? 'success' : 'default',
        duration: 1500,
      });
    }
  };

  const handleTogglePin = async () => {
    if (!post) return;
    const updated = await togglePin(post.id);
    if (updated) {
      setPost(updated);
      showToast({
        message: updated.isPinned ? '📌 Memory pinned' : 'Memory unpinned',
        variant: 'default',
        duration: 1500,
      });
    }
  };

  const handleToggleArchive = async () => {
    if (!post) return;
    if (post.isArchived) {
      const updated = await unarchivePost(post.id);
      if (updated) {
        setPost(updated);
        showToast({ message: 'Restored from archive', variant: 'success', duration: 1500 });
      }
    } else {
      const updated = await archivePost(post.id);
      if (updated) {
        setPost(updated);
        showToast({ message: 'Memory archived', variant: 'default', duration: 2000 });
      }
    }
  };

  const handleAddTag = async () => {
    if (!post || !newTag.trim()) return;
    const updated = await addTagToPost(post.id, newTag.trim());
    if (updated) {
      setPost(updated);
      setNewTag('');
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!post) return;
    const updated = await removeTagFromPost(post.id, tag);
    if (updated) setPost(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      {showFullPhoto && post && (
        <PhotoViewer
          source={{ uri: post.uri }}
          onClose={() => setShowFullPhoto(false)}
          title={post.caption}
          date={formattedDate}
          caption={post.caption}
        />
      )}

      <ScrollView
        onScroll={onScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {post ? (
          <>
            {/* Hero Image */}
            <Animated.View style={[styles.heroWrapper, { opacity: headerOpacity }]}>
              <Pressable
                onPress={() => setShowFullPhoto(true)}
                style={styles.heroImageWrapper}
                accessibilityRole="button"
                accessibilityLabel="View photo fullscreen"
              >
                <Image source={{ uri: post.uri }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.expandHint}>
                  <Text style={styles.expandHintText}>Tap to expand</Text>
                </View>
              </Pressable>
            </Animated.View>

            <View style={styles.detailsContainer}>
            {/* Header: date + actions */}
            <View style={styles.header}>
              <View style={styles.dateBlock}>
                <Text style={styles.memoryId}>{memoryId}</Text>
                <Text style={styles.dateLabel}>{formattedDate}</Text>
                <Text style={styles.timeLabel}>{timeString}</Text>
              </View>
              <View style={styles.actions}>
                <IconButton
                  icon="share"
                  onPress={handleShare}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Share memory"
                />
                <Pressable
                  onPress={handleToggleFavorite}
                  style={[styles.actionIconBtn, post.isFavorite && styles.actionIconBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={post.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Text style={styles.actionEmoji}>{post.isFavorite ? '⭐' : '☆'}</Text>
                </Pressable>
                <Pressable
                  onPress={handleTogglePin}
                  style={[styles.actionIconBtn, post.isPinned && styles.actionIconBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={post.isPinned ? 'Unpin memory' : 'Pin memory'}
                >
                  <Text style={styles.actionEmoji}>{post.isPinned ? '📌' : '📍'}</Text>
                </Pressable>
                <Pressable
                  onPress={handleToggleArchive}
                  style={styles.actionIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel={post.isArchived ? 'Restore from archive' : 'Archive memory'}
                >
                  <Text style={styles.actionEmoji}>{post.isArchived ? '📤' : '📦'}</Text>
                </Pressable>
                <IconButton
                  icon="pencil"
                  onPress={() => setIsEditing(true)}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Edit memory"
                />
                <IconButton
                  icon="trash"
                  onPress={handleDelete}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Delete memory"
                />
              </View>
            </View>

            {/* Archive banner */}
            {post.isArchived && (
              <View style={styles.archiveBanner}>
                <Text style={styles.archiveBannerText}>📦 This memory is archived</Text>
                <Pressable onPress={handleToggleArchive} accessibilityRole="button">
                  <Text style={styles.archiveBannerAction}>Restore</Text>
                </Pressable>
              </View>
            )}

            {/* Prompt Tag */}
            {post.prompt && (
              <View style={styles.promptBanner}>
                <Text style={styles.promptKicker}>DAILY PROMPT</Text>
                <Text style={styles.promptText}>"{post.prompt}"</Text>
              </View>
            )}

            {/* Reactions Bar */}
            <View style={styles.reactionsSection}>
              <Text style={styles.sectionKicker}>REACTIONS</Text>
              <ReactionBar
                reactions={post.reactions}
                userReaction={post.userReaction}
                onReact={handleReact}
              />
            </View>

            {/* Caption / Edit */}
            <View style={styles.memoryContent}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <Text style={styles.sectionKicker}>TITLE</Text>
                  <TextInput
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    style={styles.captionInput}
                    placeholder="Add a title..."
                    placeholderTextColor={colors.textMuted}
                    maxLength={80}
                    autoFocus
                    accessibilityLabel="Memory title"
                  />
                  <Text style={[styles.sectionKicker, { marginTop: spacing.md }]}>CAPTION</Text>
                  <TextInput
                    value={editedCaption}
                    onChangeText={setEditedCaption}
                    style={[styles.captionInput, styles.captionInputMulti]}
                    multiline
                    maxLength={500}
                    placeholder="Add a caption..."
                    placeholderTextColor={colors.textMuted}
                    textAlignVertical="top"
                    accessibilityLabel="Memory caption"
                  />
                  <View style={styles.editActions}>
                    <Button
                      title="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setEditedCaption(post.caption);
                        setEditedTitle(post.title || '');
                        setIsEditing(false);
                      }}
                    />
                    <Button
                      title={isSaving ? 'Saving…' : 'Save'}
                      variant="accent"
                      size="sm"
                      onPress={handleSaveCaption}
                      disabled={isSaving}
                    />
                  </View>
                </View>
              ) : (
                <>
                  {post.title && (
                    <Text style={styles.memoryTitle}>{post.title}</Text>
                  )}
                  <Text style={styles.sectionKicker}>{post.title ? 'CAPTION' : 'CAPTION'}</Text>
                  <Text style={styles.memoryCaption}>
                    {post.caption || 'No caption added for this memory.'}
                  </Text>
                </>
              )}
            </View>

            {/* Tags */}
            <View style={styles.tagsSection}>
              <View style={styles.tagsSectionHeader}>
                <Text style={styles.sectionKicker}>TAGS</Text>
                <Pressable
                  onPress={() => setShowAddTag(!showAddTag)}
                  accessibilityRole="button"
                  accessibilityLabel={showAddTag ? 'Cancel adding tag' : 'Add tag'}
                >
                  <Text style={styles.addTagLink}>{showAddTag ? 'Cancel' : '+ Add tag'}</Text>
                </Pressable>
              </View>

              {showAddTag && (
                <View style={styles.addTagRow}>
                  <TextInput
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Tag name"
                    placeholderTextColor={colors.textMuted}
                    style={styles.tagInput}
                    autoFocus
                    autoCapitalize="none"
                    autoComplete="off"
                    onSubmitEditing={handleAddTag}
                    returnKeyType="done"
                    maxLength={30}
                    accessibilityLabel="New tag name"
                  />
                  <Button title="Add" variant="accent" size="sm" onPress={handleAddTag} />
                </View>
              )}

              {post.tags && post.tags.length > 0 ? (
                <TagList tags={post.tags} onRemove={handleRemoveTag} size="md" />
              ) : (
                !showAddTag && (
                  <Text style={styles.noTagsText}>No tags yet. Add some to organize memories.</Text>
                )
              )}
            </View>

            {/* Metadata */}
            <View style={styles.metadata}>
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Category</Text>
                <Text style={styles.metadataValue}>{post.category || 'General'}</Text>
              </View>
              {post.location && (
                <>
                  <View style={styles.metadataDivider} />
                  <View style={styles.metadataSection}>
                    <Text style={styles.metadataLabel}>Location</Text>
                    <Text style={styles.metadataValue} numberOfLines={1}>
                      {post.location}
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.metadataDivider} />
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Recorded</Text>
                <Text style={styles.metadataValue}>{timeString}</Text>
              </View>
            </View>

            {/* Related Memories */}
            {relatedMemories.length > 0 && (
              <View style={styles.relatedSection}>
                <SectionHeader title="Related" subtitle={`${relatedMemories.length} memories`} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedStrip}
                >
                  {relatedMemories.map((related) => (
                    <View key={related.id} style={styles.relatedCard}>
                      <MemoryCard
                        memory={related}
                        density="compact"
                        aspectRatio={1}
                        onPress={() => router.push(`/post/${related.id}`)}
                        showMetadata={false}
                        showTags={false}
                        showReactions={false}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </View>
        </>
        ) : (
          <SkeletonPostDetail />
        )}
      </ScrollView>

      {/* Floating back button */}
      <IconButton
        icon="arrow-left"
        onPress={() => router.back()}
        variant="overlay"
        size="md"
        style={styles.floatingBack}
        accessibilityLabel="Go back"
      />

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete Memory?"
        message="This will permanently remove this photo and memory from your journal."
        confirmLabel="Delete"
        destructive
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
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
  },
  heroWrapper: {
    position: 'relative',
  },
  heroImageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  emptyHero: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElevated,
    aspectRatio: 3 / 4,
  },
  emptyHeroText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  expandHint: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(8, 8, 12, 0.7)',
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  expandHintText: {
    ...typography.sans.caption,
    color: colors.textPrimary,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: borders.hairline,
    borderColor: colors.borderSoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  dateBlock: {
    flex: 1,
  },
  memoryId: {
    ...typography.mono.micro,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  dateLabel: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  timeLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: 200,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBtnActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  actionEmoji: {
    fontSize: 16,
  },
  archiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: borders.hairline,
    borderColor: colors.warning,
  },
  archiveBannerText: {
    ...typography.sans.callout,
    color: colors.textPrimary,
  },
  archiveBannerAction: {
    ...typography.sans.callout,
    color: colors.accent,
    fontWeight: '700',
  },
  promptBanner: {
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  promptKicker: {
    ...typography.mono.micro,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  promptText: {
    ...typography.sans.callout,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  reactionsSection: {
    marginBottom: spacing.lg,
  },
  sectionKicker: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  memoryContent: {
    marginBottom: spacing.xl,
  },
  memoryTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  memoryCaption: {
    ...typography.sans.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  editContainer: {
    gap: spacing.sm,
  },
  captionInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
  },
  captionInputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  tagsSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  tagsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addTagLink: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  addTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.sans.callout,
  },
  noTagsText: {
    ...typography.sans.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  metadata: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  metadataSection: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metadataDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderSoft,
  },
  metadataLabel: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    ...typography.sans.footnote,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  relatedSection: {
    marginBottom: spacing.xl,
  },
  relatedStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  relatedCard: {
    width: 120,
  },
  bottomSpacer: {
    height: 40,
  },
  floatingBack: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
  },
  });
}
