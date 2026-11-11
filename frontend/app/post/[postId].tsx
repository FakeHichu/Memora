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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase/client';
import { spacing, layout } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Skeleton } from '@/components/ui/Skeleton';
import { PhotoViewer } from '@/components/ui/PhotoViewer';
import { useClass } from '@/hooks/useClass';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const { showToast } = useToast();
  const { classes, activeClass } = useClass();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Array<{ id: string; content: string; authorName: string; userReaction?: string }>>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchPost() {
        if (!postId || !supabase) {
          if (isActive) setPost(null);
          return;
        }
        try {
          const { data, error } = await supabase
            .from('daily_posts')
            .select(
              `*, 
               reactions (*), 
               profiles:user_id (display_name, username, avatar_path), 
               comments (*, profiles:user_id (display_name, username, avatar_path))`
            )
            .eq('id', postId)
            .single();
          if (!error && isActive) {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id ?? null;
            if (isActive) setCurrentUserId(userId);
            const formattedComments =
              data?.comments?.map((c: any) => ({
                id: c.id,
                content: c.content,
                authorName:
                  c.profiles?.display_name || c.profiles?.username || 'Classmate',
              })) || [];
            const formattedReactions = data?.reactions
              ?.map((r: any) => ({
                reaction_type: r.reaction_type,
                user_id: r.user_id,
              }));
            // Build reactionsMap and userReaction
            const reactionsMap: Record<string, number> = {};
            let userReaction: string | null = null;
            for (const r of (data?.reactions || [])) {
              reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
              if (r.user_id === userId) userReaction = r.reaction_type;
            }
            if (isActive) {
              setPost({
                ...data,
                photoUrl: data.photo_path,
                reactionsMap,
                userReaction,
              });
              setComments(formattedComments);
            }
          }
        } catch (err) {
          if (isActive) showToast({ message: 'Failed to load post.', variant: 'error', duration: 2000 });
        }
      }
      fetchPost();
      return () => {
        isActive = false;
      };
    }, [postId, supabase]),
  );
  useEffect(() => {
    let isActive = true;
    async function fetchComments() {
      if (!postId || !supabase || !post) return;
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(
            `*, profiles:user_id (display_name, username, avatar_path)`
          )
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        if (!error && isActive) {
          const formatted = data?.map((c: any) => ({
            id: c.id,
            content: c.content,
            authorName:
              c.profiles?.display_name || c.profiles?.username || 'Classmate',
          })) || [];
          if (isActive) setComments(formatted);
        }
      } catch (err) {
        if (isActive) showToast({ message: 'Failed to load comments.', variant: 'error', duration: 2000 });
      }
    }
    fetchComments();
    const interval = setInterval(() => {
      if (!isActive) clearInterval(interval);
      fetchComments();
    }, 30000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [postId, supabase, post]);
  const handleDelete = () => {
    if (!post) return;
    Alert.alert('Delete memory?', 'This memory will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!supabase) return;
          const { error } = await supabase
            .from('daily_posts')
            .delete()
            .eq('id', postId);
          if (!error) showToast({ message: 'Memory deleted.', variant: 'default', duration: 1800 });
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
  const handleSendComment = async () => {
    if (!newComment.trim() || !postId || !supabase) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;
      if (!userId) return;
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: newComment.trim(),
          is_edited: false,
        });
      if (!error) {
        setComments((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: newComment.trim(),
            authorName:
              (sessionData?.session?.user?.user_metadata?.full_name as string) ||
              sessionData?.session?.user?.email?.split('@')[0] ||
              'You',
          },
        ]);
        setNewComment('');
        showToast({ message: 'Comment posted.', variant: 'success', duration: 1800 });
      } else {
        showToast({ message: 'Failed to post comment.', variant: 'error', duration: 2000 });
      }
    } catch (err) {
      showToast({ message: 'Failed to post comment.', variant: 'error', duration: 2000 });
    }
  };
  if (!postId) {
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyText}>Memory not found</Text>
      </View>
    );
  }
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
  const isAuthor = Boolean(post?.user_id && currentUserId && post.user_id === currentUserId);
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      {showFullPhoto && post && (
        <PhotoViewer
          source={{ uri: post.photoUrl || post.photo_path }}
          onClose={() => setShowFullPhoto(false)}
          title={post.caption}
          date={formattedDate || undefined}
          caption={post.caption}
        />
      )}
      {/* Top Navigation Row */}
      <View style={styles.topNavRow}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          variant="default"
          size="sm"
          accessibilityLabel="Go back"
        />
        <Text style={styles.navTitle}>Memory Details</Text>
        <View style={styles.rightNavActions}>
          {isAuthor && (
            <IconButton
              icon="trash"
              onPress={handleDelete}
              variant="ghost"
              size="sm"
              accessibilityLabel="Delete memory"
            />
          )}
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
        {/* Main Hero Card */}
        {post ? (
          <View style={styles.heroCardContainer}>
            <Pressable
              onPress={() => setShowFullPhoto(true)}
              style={styles.heroImageWrapper}
              accessibilityRole="button"
              accessibilityLabel="View photo fullscreen"
            >
              <Image
                source={{ uri: post.photoUrl || post.photo_path }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              {/* Floating Top Left Badge: Time */}
              <View style={styles.topLeftPill}>
                <Icon name="clock" size={13} color="#FFFFFF" />
                <Text style={styles.pillText}>{timeString || 'Recently'}</Text>
              </View>
              {/* Floating Top Right Badge: Hearts */}
              <View style={styles.topRightPill}>
                <Icon
                  name="heart"
                  size={13}
                  color={post.isFavorite ? colors.highlight : '#FFFFFF'}
                  fill={post.isFavorite ? colors.highlight : undefined}
                />
                <Text style={styles.pillText}>{post.isFavorite ? 'Loved' : 'Fav'}</Text>
              </View>
              {/* Floating Bottom Author Pill */}
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
                    onPress={() => router.push(`/edit/${postId}`)}
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Info Section */}
          {post && (
            <View style={styles.detailsBody}>
              <Text style={styles.memoryTitle}>
                {post.caption || 'Captured Moment'}
              </Text>
              {post.location ? (
                <View style={styles.pillTagsRow}>
                  <View style={styles.tagCapsule}>
                    <Text style={styles.tagCapsuleText}>📍 {post.location}</Text>
                  </View>
                </View>
              ) : null}
              {post.prompt ? (
                <View style={styles.promptCard}>
                  <Text style={styles.promptLabel}>MEMORY PROMPT</Text>
                  <Text style={styles.promptText}>"{post.prompt}"</Text>
                </View>
              ) : null}
              {metadataRows(post) ? (
                <View style={styles.metadataCard}>
                  <Text style={styles.metadataSectionTitle}>Details</Text>
                  {metadataRows(post)?.map((row) => (
                    <View key={row.label} style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>{row.label}</Text>
                      <Text style={styles.metadataValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {/* Comments Section */}
              {comments.length > 0 && (
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsSectionTitle}>Comments ({comments.length})</Text>
                  {comments.map((comment) => (
                    <View
                      key={comment.id}
                      style={styles.commentItem}
                    >
                      <View style={styles.commentHeader}>
                        <Avatar
                          name={comment.authorName}
                          size={20}
                          />
                        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                      </View>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  ))}
                </View>
              )}
              {isAuthor && (
                <View style={styles.commentFormRow}>
                  <TextInput
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textMuted}
                    value={newComment}
                    onChangeText={setNewComment}
                    style={styles.commentInput}
                  />
                  <Button
                    title="Post"
                    size="sm"
                    onPress={handleSendComment}
                    disabled={!newComment.trim()}
                  />
                </View>
              )}
            </View>
          )}
          {/* Related Moments */}
          {post && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedSectionTitle}>Related moments</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {/* Related memories would be fetched from backend */}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </ScrollView>
      {/* Floating Bottom Action Bar */}
      {post && (
        <View style={[styles.floatingBottomBar, { paddingBottom: 14 }]}>
          <Pressable
            onPress={() => router.push(`/edit/${postId}`)}
            style={styles.mainActionButton}
          >
            <Icon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.mainActionButtonText}>Edit Memory</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
function metadataRows(post: any): Array<{ label: string; value: string }> | null {
  if (!post) return null;
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Category', value: post.category || 'General' },
  ];
  if (post.location) {
    rows.push({ label: 'Location', value: post.location });
  }
  if (post.prompt) {
    rows.push({ label: 'Prompt', value: `"${post.prompt}"` });
  }
  if (post.tags && post.tags.length > 0) {
    rows.push({
      label: 'Tags',
      value: post.tags.map((t: string) => `#${t}`).join(' '),
    });
  }
  const date = new Date(post.createdAt);
  rows.push({ label: 'Time', value: date.toLocaleString() });
  return rows;
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
            shadowOffset: { width: 0, height: 6 },
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
    commentsSection: {
      marginTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    commentsSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    commentItem: {
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    commentAuthor: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    commentContent: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    commentFormRow: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    commentInput: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      color: colors.textPrimary,
      fontSize: 14,
    },
    emptyView: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    authorTextBlock: {
      gap: 2,
    },
    metadataCard: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: spacing.sm,
    },
    metadataSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
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
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    relatedSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    relatedScroll: {
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    floatingBottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
      alignItems: 'center',
    },
    mainActionButton: {
      width: '100%',
      maxWidth: 400,
      height: 50,
      borderRadius: 999,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    mainActionButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });
}