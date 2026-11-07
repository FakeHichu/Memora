import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, layout } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import {
  getLocalPhotoPost,
  getLocalPhotoPosts,
  deleteLocalPhotoPost,
  toggleFavorite,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const { showToast } = useToast();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [relatedMemories, setRelatedMemories] = useState<LocalPhotoPost[]>([]);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getLocalPhotoPost(postId as string).then((savedPost) => {
        if (isActive) setPost(savedPost);
      });
      return () => {
        isActive = false;
      };
    }, [postId]),
  );
  useEffect(() => {
    let isActive = true;
    if (post) {
      getLocalPhotoPosts()
        .then((allPosts) => {
          if (!isActive) return;
          const related = allPosts
            .filter((p) => p.id !== post.id && !p.isArchived && p.category === post.category)
            .slice(0, 6);
          setRelatedMemories(related);
        })
        .catch(() => undefined);
    }
    return () => {
      isActive = false;
    };
  }, [post]);
  const date = post ? new Date(post.createdAt) : null;
  const formattedDate = date?.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeString = date?.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const handleDelete = () => {
    if (!post) return;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this memory? This cannot be undone.')) {
        deleteLocalPhotoPost(post.id).then(() => router.back());
      }
      return;
    }
    Alert.alert('Delete memory?', 'This memory will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLocalPhotoPost(post.id);
          router.back();
        },
      },
    ]);
  };
  const handleShare = async () => {
    if (!post) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: post.title || post.caption || 'Memora Memory',
            text: post.caption,
            url: window.location.href,
          });
        }
      } else {
        await Share.share({
          message: post.caption
            ? `${post.caption} — captured with Memora`
            : 'Check out this memory captured with Memora',
        });
      }
    } catch {
    }
  };
  const handleToggleFavorite = async () => {
    if (!post) return;
    const updated = await toggleFavorite(post.id);
    if (updated) {
      setPost(updated);
      showToast({
        message: updated.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        variant: 'default',
        duration: 1800,
      });
    }
  };
  const description = post ? post.caption || '' : '';
  const metadataRows: { label: string; value: string }[] = post
    ? [
        { label: 'Category', value: post.category || 'General' },
        ...(post.location ? [{ label: 'Location', value: post.location }] : []),
        ...(post.prompt ? [{ label: 'Prompt', value: `"${post.prompt}"` }] : []),
        ...(post.tags && post.tags.length > 0
          ? [{ label: 'Tags', value: post.tags.map((t) => `#${t}`).join(' ') }]
          : []),
        { label: 'Time', value: timeString || '—' },
      ]
    : [];
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      {showFullPhoto && post && (
        <PhotoViewer
          source={{ uri: post.uri }}
          onClose={() => setShowFullPhoto(false)}
          title={post.caption}
          date={formattedDate || undefined}
          caption={post.caption}
        />
      )}
      {/* Top Navigation Row (matching Screen 2 "Details") */}
      <View style={styles.topNavRow}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          variant="default"
          size="sm"
          accessibilityLabel="Go back"
        />
        <Text style={styles.navTitle}>Details</Text>
        <View style={styles.rightNavActions}>
          <IconButton
            icon="heart"
            onPress={handleToggleFavorite}
            variant={post?.isFavorite ? 'accent' : 'default'}
            size="sm"
            accessibilityLabel={post?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          />
          <IconButton
            icon="share"
            onPress={handleShare}
            variant="default"
            size="sm"
            accessibilityLabel="Share"
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Hero Card (matching Screen 2 Hero Photo) */}
        {post ? (
          <View style={styles.heroCardContainer}>
            <Pressable
              onPress={() => setShowFullPhoto(true)}
              style={styles.heroImageWrapper}
              accessibilityRole="button"
              accessibilityLabel="View photo fullscreen"
            >
              <Image source={{ uri: post.uri }} style={styles.heroImage} resizeMode="cover" />
              {/* Floating Top Left Badge: Time (e.g. 25 min in image 2) */}
              <View style={styles.topLeftPill}>
                <Icon name="clock" size={13} color="#FFFFFF" />
                <Text style={styles.pillText}>{timeString || 'Recently'}</Text>
              </View>
              {/* Floating Top Right Badge: Hearts (e.g. 385 in image 2) */}
              <View style={styles.topRightPill}>
                <Icon
                  name="heart"
                  size={13}
                  color={post.isFavorite ? colors.highlight : '#FFFFFF'}
                  fill={post.isFavorite ? colors.highlight : undefined}
                />
                <Text style={styles.pillText}>{post.isFavorite ? 'Loved' : 'Fav'}</Text>
              </View>
              {/* Floating Bottom Author Pill inside the Hero Photo (matching Mia Rose pill in image 2) */}
              <View style={styles.floatingAuthorPill}>
                <View style={styles.authorInfoBlock}>
                  <Avatar name="Memory Keeper" size={36} ring />
                  <View style={styles.authorTextBlock}>
                    <Text style={styles.authorNameText}>Memory Keeper</Text>
                    <Text style={styles.authorRoleText}>
                      {post.category || 'Personal Journal'}
                    </Text>
                  </View>
                </View>
                <View style={styles.authorActionPills}>
                  <Pressable
                    onPress={() => router.push(`/edit/${post.id}`)}
                    style={styles.authorSmallBtn}
                    accessibilityLabel="Edit memory"
                  >
                    <Icon name="pencil" size={14} color={colors.textPrimary} />
                  </Pressable>
                  <Pressable
                    onPress={handleDelete}
                    style={styles.authorSmallBtn}
                    accessibilityLabel="Delete memory"
                  >
                    <Icon name="trash" size={14} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyHero}>
            <Text style={styles.emptyHeroText}>Memory not found</Text>
          </View>
        )}
        {post && (
          <View style={styles.detailsBody}>
            {/* Memory Title */}
            <Text style={styles.memoryTitle}>
              {post.title || post.caption || 'Captured Moment'}
            </Text>
            {/* Tag Badges (matching Easy, 2 Serving, 4.8 in reference image) */}
            <View style={styles.pillTagsRow}>
              <View style={styles.tagCapsule}>
                <Text style={styles.tagCapsuleText}>{post.category || 'General'}</Text>
              </View>
              {post.location ? (
                <View style={styles.tagCapsule}>
                  <Text style={styles.tagCapsuleText}>📍 {post.location}</Text>
                </View>
              ) : null}
              <View style={styles.tagCapsule}>
                <Text style={[styles.tagCapsuleText, { color: colors.highlight }]}>★ 4.9</Text>
              </View>
            </View>
            {/* Description Paragraph */}
            {description ? (
              <Text style={styles.memoryDescription}>{description}</Text>
            ) : (
              <Text style={styles.memoryDescription}>
                Captured on {formattedDate} at {timeString}. A special memory safely preserved in
                Memora.
              </Text>
            )}
            {/* Prompt Quote (if any) */}
            {post.prompt ? (
              <View style={styles.promptCard}>
                <Text style={styles.promptLabel}>MEMORY PROMPT</Text>
                <Text style={styles.promptText}>"{post.prompt}"</Text>
              </View>
            ) : null}
            {/* Metadata Card */}
            {metadataRows.length > 0 && (
              <View style={styles.metadataCard}>
                <Text style={styles.metadataSectionTitle}>Details & Metadata</Text>
                {metadataRows.map((row, index) => (
                  <View key={row.label} style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>{row.label}</Text>
                    <Text style={styles.metadataValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}
            {/* Related Moments (matching Cooking Steps / Highlights in image 2) */}
            {relatedMemories.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedSectionTitle}>Related moments</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedScroll}
                >
                  {relatedMemories.map((related) => (
                    <Pressable
                      key={related.id}
                      onPress={() => router.push(`/post/${related.id}`)}
                      style={styles.relatedTile}
                      accessibilityRole="button"
                    >
                      <Image
                        source={{ uri: related.uri }}
                        style={styles.relatedImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      {/* Floating Bottom Action Bar (matching "Start Cooking" capsule in reference image 2) */}
      {post && (
        <View style={[styles.floatingBottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable
            onPress={() => router.push(`/edit/${post.id}`)}
            style={({ pressed }) => [styles.mainActionButton, pressed && styles.buttonPressed]}
          >
            <Icon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.mainActionButtonText}>Edit Memory</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    navTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    rightNavActions: {
      flexDirection: 'row',
      gap: 10,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingBottom: 120,
    },
    heroCardContainer: {
      paddingHorizontal: spacing.lg,
      marginVertical: spacing.sm,
    },
    heroImageWrapper: {
      width: '100%',
      aspectRatio: 4 / 3.4,
      borderRadius: 28,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.5)'
              : '0 10px 30px rgba(48, 36, 61, 0.08)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }),
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    topLeftPill: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(20, 14, 30, 0.72)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any)
        : {}),
    },
    topRightPill: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(20, 14, 30, 0.72)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any)
        : {}),
    },
    pillText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    floatingAuthorPill: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      backgroundColor: isDark ? 'rgba(33, 22, 51, 0.92)' : 'rgba(255, 253, 248, 0.94)',
      borderRadius: 20,
      padding: 10,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.borderSoft,
      ...(Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    authorInfoBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    authorTextBlock: {
      gap: 1,
    },
    authorNameText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    authorRoleText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    authorActionPills: {
      flexDirection: 'row',
      gap: 8,
    },
    authorSmallBtn: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: colors.surfaceOverlay,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyHero: {
      marginHorizontal: spacing.lg,
      aspectRatio: 16 / 9,
      backgroundColor: colors.card,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyHeroText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    detailsBody: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      gap: 16,
    },
    memoryTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.4,
      lineHeight: 34,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    },
    pillTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagCapsule: {
      backgroundColor: colors.surfaceOverlay,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    tagCapsuleText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    memoryDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 23,
    },
    promptCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 6,
    },
    promptLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 0.8,
    },
    promptText: {
      fontSize: 15,
      color: colors.textPrimary,
      fontStyle: 'italic',
      lineHeight: 22,
    },
    metadataCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 12,
    },
    metadataSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2,
    },
    metadataLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    metadataValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    relatedSection: {
      gap: 12,
      marginTop: 4,
    },
    relatedSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    relatedScroll: {
      gap: 12,
    },
    relatedTile: {
      width: 100,
      height: 100,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    relatedImage: {
      width: '100%',
      height: '100%',
    },
    bottomSpacer: {
      height: 40,
    },
    floatingBottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingTop: 10,
    },
    mainActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? '#8052C8' : '#261D32',
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(195, 166, 242, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }),
    },
    mainActionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    buttonPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.97 }],
    },
  });
}