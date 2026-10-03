import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { useAppTheme } from '@/providers/ThemeProvider';

type MemoryFilter = 'All' | 'Mine' | 'Friends' | 'Class' | 'Events';
type MemoryView = 'Timeline' | 'Grid';
const filters: MemoryFilter[] = ['All', 'Mine', 'Friends', 'Class', 'Events'];
const timelineBuckets = ['Today', 'This week', 'This month', 'Earlier'];

function getTimelineBucket(createdAt: string) {
  const postDate = new Date(createdAt);
  const today = new Date();
  const dateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDifference = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / 86_400_000);

  if (dayDifference === 0) return 'Today';
  if (dayDifference < 7) return 'This week';
  if (postDate.getMonth() === today.getMonth() && postDate.getFullYear() === today.getFullYear()) return 'This month';
  return 'Earlier';
}

function getMonthLabel(createdAt: string) {
  return new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();
}

export default function MemoriesScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MemoryFilter>('All');
  const [view, setView] = useState<MemoryView>('Timeline');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      getLocalPhotoPosts()
        .then((savedPosts) => {
          if (isActive) setPosts(savedPosts);
        })
        .catch(() => {
          if (isActive) setPosts([]);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, []),
  );

  const visiblePosts = filter === 'All' || filter === 'Mine' ? posts : [];
  const groupedPosts = view === 'Timeline'
    ? timelineBuckets.map((title) => ({ title, posts: visiblePosts.filter((post) => getTimelineBucket(post.createdAt) === title) }))
    : Array.from(new Set(visiblePosts.map((post) => getMonthLabel(post.createdAt)))).map((title) => ({
        title,
        posts: visiblePosts.filter((post) => getMonthLabel(post.createdAt) === title),
      }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>MEMORA</Text>
            <Text style={styles.title}>Memories</Text>
          </View>
          <View style={styles.countMark}>
            <Text style={styles.countNumber}>{posts.length}</Text>
            <Text style={styles.countLabel}>SAVED</Text>
          </View>
        </View>

        <View style={styles.introRow}>
          <Text style={styles.intro}>A timeline of the little things you kept.</Text>
          <View style={styles.privateTag}><Text style={styles.privateGlyph}>⌑</Text><Text style={styles.privateText}>PRIVATE</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item.toLowerCase()} memories`}
              accessibilityState={{ selected: filter === item }}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.viewSwitch} accessibilityLabel="Memory layout">
          {(['Timeline', 'Grid'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setView(item)}
              style={[styles.viewOption, view === item && styles.viewOptionActive]}
              accessibilityRole="button"
              accessibilityLabel={`${item} view`}
              accessibilityState={{ selected: view === item }}
            >
              <Text style={[styles.viewIcon, view === item && styles.viewIconActive]}>{item === 'Timeline' ? '☷' : '▦'}</Text>
              <Text style={[styles.viewText, view === item && styles.viewTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? <Text style={styles.statusMessage}>Gathering your memories…</Text> : null}
        {!isLoading && filter !== 'All' && filter !== 'Mine' ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyGlyph}>⌂</Text>
            <Text style={styles.emptyTitle}>Shared memories stay private.</Text>
            <Text style={styles.emptyText}>Friend, class, and event memories will appear here when their verified sharing services are connected.</Text>
          </View>
        ) : null}
        {!isLoading && filter === 'All' && posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyGlyph}>◷</Text>
            <Text style={styles.emptyTitle}>Your first memory starts here.</Text>
            <Text style={styles.emptyText}>Photos you take are saved privately on this device and collected here by date.</Text>
            <Pressable style={styles.captureButton} onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Capture your first memory">
              <Text style={styles.captureButtonText}>Capture a moment  ↗</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && visiblePosts.length > 0 && groupedPosts.map((group) => (
          group.posts.length ? (
            <View key={group.title} style={styles.group}>
              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.monthTitle}>{group.title}</Text>
                  <Text style={styles.monthCount}>{group.posts.length} {group.posts.length === 1 ? 'memory' : 'memories'}</Text>
                </View>
                <Text style={styles.yearMark}>{new Date().getFullYear()}</Text>
              </View>
              {view === 'Grid' ? (
                <View style={styles.grid}>
                  {group.posts.map((post) => <MemoryTile key={post.id} post={post} />)}
                </View>
              ) : (
                <View style={styles.timelineList}>
                  {group.posts.map((post, index) => (
                    <View key={post.id} style={styles.timelineItem}>
                      <View style={styles.timelineRail}>
                        <View style={styles.timelineDot} />
                        {index < group.posts.length - 1 ? <View style={styles.timelineLine} /> : null}
                      </View>
                      <Pressable style={styles.timelinePost} onPress={() => router.push(`/post/${post.id}`)} accessibilityRole="button" accessibilityLabel={`Open memory from ${new Date(post.createdAt).toLocaleDateString()}`}>
                        <Image source={{ uri: post.uri }} style={styles.timelinePhoto} resizeMode="cover" accessibilityLabel={post.caption || 'Saved memory'} />
                        <View style={styles.timelineCopy}>
                          <Text style={styles.memoryDate}>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
                          <Text numberOfLines={2} style={styles.memoryCaption}>{post.caption || 'A moment from today'}</Text>
                          <Text style={styles.memoryPrivacy}>ON THIS DEVICE</Text>
                        </View>
                        <Text style={styles.memoryArrow}>›</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MemoryTile({ post }: { post: LocalPhotoPost }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.tile} onPress={() => router.push(`/post/${post.id}`)} accessibilityRole="button" accessibilityLabel={`Open memory: ${post.caption || 'A moment from today'}`}>
      <Image source={{ uri: post.uri }} style={styles.tilePhoto} resizeMode="cover" accessibilityLabel={post.caption || 'Saved memory'} />
      <Text numberOfLines={1} style={styles.tileCaption}>{post.caption || 'A moment from today'}</Text>
      <Text style={styles.tileDate}>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  countMark: { minWidth: 54, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface },
  countNumber: { color: colors.text, fontSize: 18, fontWeight: '700' },
  countLabel: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  introRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  intro: { flex: 1, color: colors.muted, fontSize: 13 },
  privateTag: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, borderRadius: 14, backgroundColor: colors.surface },
  privateGlyph: { color: colors.primaryDark, fontSize: 15 },
  privateText: { color: colors.primaryDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  filterRail: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { minHeight: 38, justifyContent: 'center', paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 19, backgroundColor: colors.glass },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.onPrimary },
  viewSwitch: { alignSelf: 'flex-start', flexDirection: 'row', padding: 3, borderRadius: radius.md, backgroundColor: colors.surface },
  viewOption: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: 9 },
  viewOptionActive: { backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.border },
  viewIcon: { color: colors.muted, fontSize: 15 },
  viewIconActive: { color: colors.primaryDark },
  viewText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  viewTextActive: { color: colors.text, fontWeight: '700' },
  statusMessage: { color: colors.muted, fontSize: 13, paddingVertical: spacing.lg },
  emptyState: { alignItems: 'flex-start', paddingVertical: spacing.xxl, paddingHorizontal: spacing.sm, gap: spacing.sm },
  emptyGlyph: { color: colors.primary, fontSize: 34, marginBottom: spacing.xs },
  emptyTitle: { ...typography.subheading, color: colors.text },
  emptyText: { maxWidth: 340, color: colors.muted, fontSize: 13, lineHeight: 20 },
  captureButton: { minHeight: 44, justifyContent: 'center', marginTop: spacing.sm, paddingRight: spacing.md },
  captureButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  group: { gap: spacing.md },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1, borderColor: colors.border },
  monthTitle: { color: colors.text, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  monthCount: { color: colors.muted, fontSize: 10, marginTop: 2 },
  yearMark: { color: colors.primaryDark, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  timelineList: { gap: 0 },
  timelineItem: { minHeight: 110, flexDirection: 'row', gap: spacing.md },
  timelineRail: { width: 14, alignItems: 'center' },
  timelineDot: { width: 8, height: 8, marginTop: 16, borderRadius: 4, backgroundColor: colors.primary },
  timelineLine: { flex: 1, width: 1, backgroundColor: colors.border },
  timelinePost: { flex: 1, minHeight: 102, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border },
  timelinePhoto: { width: 86, height: 86, borderRadius: radius.sm, backgroundColor: colors.surface },
  timelineCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  memoryDate: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  memoryCaption: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  memoryPrivacy: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  memoryArrow: { color: colors.muted, fontSize: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '31.6%', marginBottom: spacing.sm, gap: spacing.xs },
  tilePhoto: { width: '100%', aspectRatio: 0.88, borderRadius: radius.sm, backgroundColor: colors.surface },
  tileCaption: { color: colors.text, fontSize: 10, fontWeight: '600' },
  tileDate: { color: colors.muted, fontSize: 9 },
  });
}
