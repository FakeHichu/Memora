import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState, useRef, useEffect } from 'react';
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

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  deleteLocalPhotoPost,
  getLocalPhotoPost,
  toggleLocalPhotoReaction,
  updateLocalPhotoCaption,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';
import { ReactionBar } from '@/components/ui/ReactionBar';
import { Button } from '@/components/ui/Button';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [headerOpacity] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0));

  const loadPost = useCallback(() => {
    if (!postId) return;
    getLocalPhotoPost(postId).then((savedPost) => {
      if (savedPost) {
        setPost(savedPost);
        setEditedCaption(savedPost.caption);
      }
    });
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveCaption = async () => {
    if (!post) return;
    setIsSaving(true);
    try {
      const updated = await updateLocalPhotoCaption(post.id, editedCaption.trim());
      if (updated) {
        setPost(updated);
        setIsEditing(false);
      }
    } catch {
      Alert.alert('Error', 'Could not update memory caption.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!post) return;
    Alert.alert(
      'Delete Memory?',
      'This will permanently remove this photo and memory from your journal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteLocalPhotoPost(post.id);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Could not delete the memory.');
            }
          },
        },
      ],
    );
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
    if (updated) {
      setPost(updated);
    }
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
        {/* Hero Image */}
        <Animated.View style={[styles.heroWrapper, { opacity: headerOpacity }]}>
          {post ? (
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
          ) : (
            <View style={[styles.heroImage, styles.emptyHero]}>
              <Text style={styles.emptyHeroText}>Memory not found</Text>
            </View>
          )}
        </Animated.View>

        {post && (
          <View style={styles.detailsContainer}>
            {/* Header with date and actions */}
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
                  accessibilityLabel="Share"
                />
                <IconButton
                  icon="pencil"
                  onPress={handleEdit}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Edit"
                />
                <IconButton
                  icon="trash"
                  onPress={handleDelete}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Delete"
                />
              </View>
            </View>

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

            {/* Memory Caption or Edit View */}
            <View style={styles.memoryContent}>
              <Text style={styles.sectionKicker}>CAPTION</Text>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editedCaption}
                    onChangeText={setEditedCaption}
                    style={styles.captionInput}
                    multiline
                    maxLength={280}
                    placeholder="Add a caption..."
                    placeholderTextColor={colors.textMuted}
                  />
                  <View style={styles.editActions}>
                    <Button
                      title="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setEditedCaption(post.caption);
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
                <Text style={styles.memoryCaption}>
                  {post.caption || 'No caption added for this memory.'}
                </Text>
              )}
            </View>

            {/* Details & Tags */}
            <View style={styles.metadata}>
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Category</Text>
                <Text style={styles.metadataValue}>{post.category || 'General'}</Text>
              </View>
              <View style={styles.metadataDivider} />
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Recorded</Text>
                <Text style={styles.metadataValue}>{timeString}</Text>
              </View>
            </View>

            {/* Bottom spacer for layout */}
            <View style={styles.bottomSpacer} />
          </View>
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
  memoryCaption: {
    ...typography.sans.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  editContainer: {
    marginTop: spacing.xs,
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
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
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
    marginBottom: 2,
  },
  metadataValue: {
    ...typography.sans.footnote,
    color: colors.textPrimary,
    fontWeight: '600',
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