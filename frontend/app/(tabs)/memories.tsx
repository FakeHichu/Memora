import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  toggleLocalPhotoReaction,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

const MEMORY_FILTERS = ['All', 'People', 'Places', 'Events'];
type ViewMode = 'timeline' | 'calendar';

export default function MemoriesScreen() {
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const loadPosts = useCallback(() => {
    let isActive = true;

    getLocalPhotoPosts()
      .then((savedPosts) => {
        if (isActive) {
          setPosts(savedPosts);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setPosts([]);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadPosts);

  const handleReact = async (postId: string, emoji: string) => {
    const updated = await toggleLocalPhotoReaction(postId, emoji);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  };

  // Group posts by month
  const groupedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (selectedFilter !== 'All' && post.category !== selectedFilter) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const caption = (post.caption || '').toLowerCase();
      const prompt = (post.prompt || '').toLowerCase();
      const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
      return caption.includes(query) || prompt.includes(query) || dateStr.includes(query);
    });

    const groups: Record<string, LocalPhotoPost[]> = {};
    for (const post of filtered) {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [year, month] = key.split('-').map(Number);
        const monthTitle = new Date(year, month).toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        });
        return { key, title: monthTitle, items };
      });
  }, [posts, selectedFilter, searchQuery]);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map memories to date string YYYY-MM-DD
    const memoriesByDate: Record<string, LocalPhotoPost> = {};
    for (const post of posts) {
      const postDateStr = post.createdAt.slice(0, 10);
      if (!memoriesByDate[postDateStr]) {
        memoriesByDate[postDateStr] = post;
      }
    }

    type CalendarCell = {
      day: number | null;
      dateStr: string;
      memory: LocalPhotoPost | null;
    };
    const grid: CalendarCell[] = [];
    // Blank days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: null, dateStr: '', memory: null });
    }
    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      grid.push({
        day: d,
        dateStr,
        memory: memoriesByDate[dateStr] || null,
      });
    }

    return grid;
  }, [calendarDate, posts]);

  const monthName = calendarDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          title="Memories"
          subtitle={
            posts.length > 0
              ? `${posts.length} ${posts.length === 1 ? 'memory' : 'memories'}`
              : undefined
          }
          rightAction={{
            icon: showSearch ? 'close' : 'search',
            onPress: () => setShowSearch(!showSearch),
            accessibilityLabel: showSearch ? 'Close search' : 'Search memories',
          }}
        />

        {showSearch && (
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your memories…"
              autoFocus={true}
              onClear={() => setSearchQuery('')}
              floating
            />
          </View>
        )}

        {/* View mode toggle: Timeline vs Calendar */}
        <View style={styles.viewModeRow}>
          <View style={styles.viewModeToggle}>
            <Pressable
              onPress={() => setViewMode('timeline')}
              style={[
                styles.viewModeButton,
                viewMode === 'timeline' && styles.viewModeButtonActive,
              ]}
            >
              <Text
                style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}
              >
                Timeline
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('calendar')}
              style={[
                styles.viewModeButton,
                viewMode === 'calendar' && styles.viewModeButtonActive,
              ]}
            >
              <Text
                style={[styles.viewModeText, viewMode === 'calendar' && styles.viewModeTextActive]}
              >
                Calendar
              </Text>
            </Pressable>
          </View>
        </View>

        {viewMode === 'timeline' && (
          <>
            <FilterChips
              filters={MEMORY_FILTERS}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />

            {isLoading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading your memories…</Text>
              </View>
            ) : groupedPosts.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No memories found' : 'Your memories will live here'}
                message={
                  searchQuery
                    ? 'Try searching with different terms.'
                    : 'Take a photo each day to build your chronological memory journal.'
                }
                icon="calendar"
                action={
                  searchQuery
                    ? undefined
                    : {
                        label: 'Capture a memory',
                        onPress: () => router.push('/(tabs)/create'),
                      }
                }
                style={styles.emptyState}
              />
            ) : (
              groupedPosts.map((group) => (
                <View key={group.key} style={styles.monthGroup}>
                  <SectionHeader
                    title={group.title}
                    subtitle={`${group.items.length} ${group.items.length === 1 ? 'memory' : 'memories'}`}
                  />
                  <View style={styles.memoryList}>
                    {group.items.map((post) => (
                      <MemoryCard
                        key={post.id}
                        memory={post}
                        density="timeline"
                        aspectRatio={4 / 3}
                        onPress={() => router.push(`/post/${post.id}`)}
                        showMemoryId={true}
                        showReactions={true}
                        onReact={(emoji) => handleReact(post.id, emoji)}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Calendar View Mode */}
        {viewMode === 'calendar' && (
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={prevMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <Pressable onPress={nextMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            {/* Days of week */}
            <View style={styles.weekRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Grid of days */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((cell, idx) => (
                <View key={idx} style={styles.calendarCell}>
                  {cell.day !== null ? (
                    cell.memory ? (
                      <Pressable
                        onPress={() => router.push(`/post/${cell.memory!.id}`)}
                        style={styles.memoryTile}
                      >
                        <Image
                          source={{ uri: cell.memory.uri }}
                          style={styles.tileImage}
                          resizeMode="cover"
                        />
                        <View style={styles.tileBadge}>
                          <Text style={styles.tileDayText}>{cell.day}</Text>
                        </View>
                      </Pressable>
                    ) : (
                      <View style={styles.emptyDayCell}>
                        <Text style={styles.emptyDayText}>{cell.day}</Text>
                      </View>
                    )
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingBottom: spacing.xxxl + layout.tabBarHeight,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  viewModeRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceFloating,
    borderRadius: radius.round,
    padding: 3,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  viewModeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
  },
  viewModeButtonActive: {
    backgroundColor: colors.accent,
  },
  viewModeText: {
    ...typography.sans.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  monthGroup: {
    marginBottom: spacing.xl,
  },
  memoryList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  calendarContainer: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.backgroundElevated,
  },
  navButtonText: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  monthTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekDayText: {
    ...typography.sans.caption2,
    fontWeight: '700',
    color: colors.textMuted,
    width: 38,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  calendarCell: {
    width: '13%',
    aspectRatio: 1,
    marginVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryTile: {
    width: '100%',
    height: '100%',
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: borders.hairline,
    borderColor: colors.accentSoft,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(8, 8, 12, 0.6)',
    borderRadius: 3,
    paddingHorizontal: 3,
  },
  tileDayText: {
    ...typography.sans.caption2,
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyDayCell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.sm,
  },
  emptyDayText: {
    ...typography.sans.caption2,
    color: colors.textMuted,
  },
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bottomSpacer: {
    height: 40,
  },
});