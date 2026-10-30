import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, typography, layout, borders, shadows } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { getLocalPhotoPost, getLocalPhotoPosts, deleteLocalPhotoPost, toggleFavorite, type LocalPhotoPost } from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { showToast } = useToast();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [headerOpacity] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0));
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

  const handleDelete = () => {
    if (!post) return;
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (
        typeof window !== 'undefined' &&
        window.confirm('Delete this memory? This cannot be undone.')
      ) {
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
      // ignore cancelled shares
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
        ...(post.location
          ? [{ label: 'Location', value: post.location }]
          : []),
        ...(post.prompt
          ? [{ label: 'Prompt', value: `"${post.prompt}"` }]
          : []),
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
                <Text style={styles.timeLabel}>{timeString || '—'}</Text>
              </View>
              <View style={styles.actions}>
                <IconButton
                  icon="star"
                  onPress={handleToggleFavorite}
                  variant={post.isFavorite ? 'accent' : 'default'}
                  size="sm"
                  accessibilityLabel={post.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                />
                <IconButton
                  icon="share"
                  onPress={handleShare}
                  variant="default"
                  size="sm"
                  accessibilityLabel="Share"
                />
                <IconButton
                  icon="pencil"
                  onPress={() => router.push(`/edit/${post.id}`)}
                  variant="default"
                  size="sm"
                  accessibilityLabel="Edit memory"
                />
                <IconButton
                  icon="trash"
                  onPress={handleDelete}
                  variant="default"
                  size="sm"
                  accessibilityLabel="Delete"
                />
              </View>
            </View>

            {/* Memory Title & Description */}
            <View style={styles.memoryContent}>
              <Text style={styles.memoryTitle} numberOfLines={2}>
                {post.title || post.caption || 'Untitled memory'}
              </Text>
              {description ? <Text style={styles.memoryDescription}>{description}</Text> : null}
            </View>

            {/* Memory Metadata */}
            {metadataRows.length > 0 && (
              <View style={styles.metadataCard}>
                {metadataRows.map((row, index) => (
                  <React.Fragment key={row.label}>
                    {index > 0 && <View style={styles.metadataDivider} />}
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>{row.label}</Text>
                      <Text style={styles.metadataValue}>{row.value}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* Related Photographs */}
            {relatedMemories.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>Related moments</Text>
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
                      accessibilityLabel={`Open related memory: ${related.caption || related.title || 'Untitled memory'}`}
                    >
                      <Image source={{ uri: related.uri }} style={styles.relatedImage} resizeMode="cover" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bottom spacer for safe area */}
            <View style={styles.bottomSpacer} />
          </View>
        )}
      </ScrollView>

      {/* Floating back button with safe area top inset */}
      <IconButton
        icon="arrow-left"
        onPress={() => router.back()}
        variant="default"
        size="md"
        style={{
          ...styles.floatingBack,
          top: Math.max(insets.top + spacing.xs, spacing.md),
        }}
        accessibilityLabel="Go back"
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
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
      borderRadius: radius.xl,
    },
    emptyHero: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: radius.xl,
    },
    emptyHeroText: {
      ...typography.body,
      color: colors.textMuted,
    },
    expandHint: {
      position: 'absolute',
      bottom: spacing.lg,
      right: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: 'rgba(23, 25, 29, 0.7)',
      borderRadius: radius.round,
      borderWidth: borders.hairline,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    expandHintText: {
      ...typography.caption,
      color: colors.textPrimary,
    },
    detailsContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      marginTop: -spacing.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.massive,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xl,
    },
    dateBlock: {
      flex: 1,
    },
    memoryId: {
      ...typography.caption,
      color: colors.accent,
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    dateLabel: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      lineHeight: 28,
    },
    timeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    memoryContent: {
      marginBottom: spacing.xl,
    },
    memoryTitle: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      lineHeight: 38,
    },
    memoryDescription: {
      ...typography.serifItalic.body,
      color: colors.textSecondary,
      lineHeight: 26,
    },
    metadataCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      ...(Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(23, 25, 29, 0.06)' } : { ...shadows.md }),
      marginBottom: spacing.xl,
    },
    metadataDivider: {
      height: borders.hairline,
      backgroundColor: colors.borderSoft,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    metadataLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metadataValue: {
      ...typography.body,
      color: colors.textPrimary,
      textAlign: 'right',
      flex: 1,
      marginLeft: spacing.md,
    },
    relatedSection: {
      marginBottom: spacing.xl,
    },
    relatedTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    relatedScroll: {
      gap: spacing.sm,
    },
    relatedTile: {
      width: 84,
      height: 84,
      borderRadius: radius.md,
      overflow: 'hidden',
      backgroundColor: colors.backgroundSecondary,
    },
    relatedImage: {
      width: '100%',
      height: '100%',
    },
    bottomSpacer: {
      height: spacing.huge,
    },
    floatingBack: {
      position: 'absolute',
      left: spacing.lg,
      zIndex: 100,
    },
  });
}
