import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Avatar } from '@/components/ui/Avatar';
import type { LocalPhotoPost } from '@/lib/photo-draft';

interface ClassmateStoryItem {
  id: string;
  name: string;
  avatarUrl?: string | null;
  hasActiveMemory?: boolean;
  postId?: string;
  photoUri?: string;
  caption?: string;
}

interface CircleStoryRollProps {
  currentUserName?: string;
  currentUserAvatar?: string | null;
  posts: LocalPhotoPost[];
  onSelectMemory?: (post: LocalPhotoPost) => void;
}

export function CircleStoryRoll({
  currentUserName = 'You',
  currentUserAvatar,
  posts = [],
  onSelectMemory,
}: CircleStoryRollProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  // Group posts by author to create unique classmate stories
  const classmateMap = new Map<string, ClassmateStoryItem>();

  (posts || []).forEach((post) => {
    if (!post) return;
    const author = post.authorName || 'Classmate';
    if (!classmateMap.has(author)) {
      classmateMap.set(author, {
        id: post.id || Math.random().toString(),
        name: author,
        avatarUrl: post.authorAvatar,
        hasActiveMemory: true,
        postId: post.id,
        photoUri: post.uri,
        caption: post.caption,
      });
    }
  });

  const classmates = Array.from(classmateMap.values());

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User's Quick Capture / Add Memory Bubble */}
        <Pressable
          style={styles.storyBubble}
          onPress={() => router.push('/(tabs)/create')}
          accessibilityRole="button"
          accessibilityLabel="Add memory to class circle"
        >
          <View style={styles.myAvatarWrapper}>
            <Avatar
              name={currentUserName}
              size={52}
              photoUri={currentUserAvatar || undefined}
            />
            <View style={styles.addBadge}>
              <Text style={styles.addBadgeText}>+</Text>
            </View>
          </View>
          <Text style={styles.storyName} numberOfLines={1}>
            Add Memory
          </Text>
        </Pressable>

        {/* Classmates with active memories */}
        {classmates.map((item) => {
          const matchingPost = posts.find((p) => p.id === item.postId);
          return (
            <Pressable
              key={item.id}
              style={styles.storyBubble}
              onPress={() => {
                if (matchingPost && onSelectMemory) {
                  onSelectMemory(matchingPost);
                } else if (item.postId) {
                  router.push(`/post/${item.postId}`);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.name}'s memory`}
            >
              <View style={styles.activeStoryRing}>
                <View style={styles.avatarInner}>
                  <Avatar
                    name={item.name}
                    size={48}
                    photoUri={item.avatarUrl || undefined}
                  />
                </View>
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {(item.name || 'Classmate').split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}

        {/* Fallback default classmates if no circle posts exist yet */}
        {classmates.length === 0 && (
          <>
            {['Sarah', 'Alex', 'Priya'].map((name, idx) => (
              <View key={idx} style={[styles.storyBubble, { opacity: 0.65 }]}>
                <View style={styles.inactiveRing}>
                  <Avatar name={name} size={48} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                  {name}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any, mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      gap: 14,
      alignItems: 'center',
    },
    storyBubble: {
      alignItems: 'center',
      width: 64,
    },
    myAvatarWrapper: {
      position: 'relative',
      padding: 2,
    },
    addBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    addBadgeText: {
      color: colors.crust,
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 16,
    },
    activeStoryRing: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    inactiveRing: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderSoft,
    },
    avatarInner: {
      padding: 2,
    },
    storyName: {
      ...typography.sans.caption2,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
      fontWeight: '500',
      fontSize: 11,
    },
  });
}
