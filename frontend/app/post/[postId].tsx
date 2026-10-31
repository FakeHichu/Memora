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

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { getLocalPhotoPost, deleteLocalPhotoPost, type LocalPhotoPost } from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [headerOpacity] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getLocalPhotoPost(postId).then((savedPost) => {
        if (isActive) setPost(savedPost);
      });
      return () => {
        isActive = false;
      };
    }, [postId]),
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
                  icon="trash"
                  onPress={handleDelete}
                  variant="overlay"
                  size="sm"
                  accessibilityLabel="Delete"
                />
              </View>
            </View>

            {/* Memory Title & Caption */}
            <View style={styles.memoryContent}>
              <Text style={styles.memoryTitle} numberOfLines={2}>
                {post.title || post.caption || 'Untitled memory'}
              </Text>
              {post.caption ? <Text style={styles.memoryCaption}>{post.caption}</Text> : null}
            </View>

            {/* Real Metadata */}
            <View style={styles.metadata}>
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Category</Text>
                <Text style={styles.metadataValue}>{post.category || 'General'}</Text>
              </View>

              {post.location ? (
                <>
                  <View style={styles.metadataDivider} />
                  <View style={styles.metadataSection}>
                    <Text style={styles.metadataLabel}>Location</Text>
                    <Text style={styles.metadataValue}>{post.location}</Text>
                  </View>
                </>
              ) : null}

              {post.prompt ? (
                <>
                  <View style={styles.metadataDivider} />
                  <View style={styles.metadataSection}>
                    <Text style={styles.metadataLabel}>Prompt</Text>
                    <Text style={styles.metadataValue}>"{post.prompt}"</Text>
                  </View>
                </>
              ) : null}

              {post.tags && post.tags.length > 0 ? (
                <>
                  <View style={styles.metadataDivider} />
                  <View style={styles.metadataSection}>
                    <Text style={styles.metadataLabel}>Tags</Text>
                    <Text style={styles.metadataValue}>
                      {post.tags.map((t) => `#${t}`).join(' ')}
                    </Text>
                  </View>
                </>
              ) : null}

              <View style={styles.metadataDivider} />
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Time</Text>
                <Text style={styles.metadataValue}>{timeString}</Text>
              </View>
            </View>

            {/* Bottom spacer for safe area */}
            <View style={styles.bottomSpacer} />
          </View>
        )}
      </ScrollView>

      {/* Floating back button with safe area top inset */}
      <IconButton
        icon="arrow-left"
        onPress={() => router.back()}
        variant="overlay"
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
    backgroundColor: colors.backgroundSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  expandHintText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
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
    ...typography.sans.title2,
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
    ...typography.sans.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  memoryCaption: {
    ...typography.sans.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  metadata: {
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  metadataSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  metadataDivider: {
    height: borders.hairline,
    backgroundColor: colors.borderSoft,
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
  bottomSpacer: {
    height: spacing.huge,
  },
  floatingBack: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 100,
  },
});
