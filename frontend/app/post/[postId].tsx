import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { getLocalPhotoPost, type LocalPhotoPost } from '@/lib/photo-draft';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';

export default function PostDetailScreen() {
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

  const handleEdit = () => {
    console.log('Edit memory:', post?.id);
  };

  const handleDelete = () => {
    console.log('Delete memory:', post?.id);
  };

  const handleShare = () => {
    console.log('Share memory:', post?.id);
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

            {/* Memory Title & Caption */}
            <View style={styles.memoryContent}>
              <Text style={styles.memoryTitle} numberOfLines={2}>
                {post.caption || 'Untitled memory'}
              </Text>
              {post.caption && <Text style={styles.memoryCaption}>{post.caption}</Text>}
            </View>

            {/* Metadata */}
            <View style={styles.metadata}>
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>People</Text>
                <Text style={styles.metadataValue}>You · Alex · Sam</Text>
              </View>
              <View style={styles.metadataDivider} />
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Location</Text>
                <Text style={styles.metadataValue}>Marina Beach</Text>
              </View>
              <View style={styles.metadataDivider} />
              <View style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>Time</Text>
                <Text style={styles.metadataValue}>{timeString}</Text>
              </View>
            </View>

            {/* Bottom spacer for tab bar */}
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
    backgroundColor: 'rgba(9, 9, 12, 0.7)',
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: 'rgba(191, 195, 204, 0.1)',
  },
  expandHintText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: -radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl + layout.tabBarHeight,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dateBlock: {
    gap: spacing.xs,
  },
  memoryId: {
    ...typography.mono.micro,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateLabel: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  timeLabel: {
    ...typography.mono.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  memoryContent: {
    gap: spacing.md,
  },
  memoryTitle: {
    ...typography.serif.title,
    color: colors.textPrimary,
    lineHeight: 38,
  },
  memoryCaption: {
    ...typography.serifItalic.body,
    color: colors.textSecondary,
    lineHeight: 26,
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
    top: spacing.lg + 50,
    left: spacing.lg,
    zIndex: 100,
  },
});
