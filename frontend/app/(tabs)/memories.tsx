import { router, useFocusEffect } from 'expo-router';
<<<<<<< HEAD
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
=======
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getLocalPhotoPosts,
  toggleLocalPhotoReaction,
  bulkAction,
  type LocalPhotoPost,
} from '@/lib/photo-draft';
import { MemoryCard } from '@/components/ui/MemoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

const MEMORY_FILTERS = ['All', 'Favorites', 'Pinned', 'Archived', 'People', 'Places', 'Events'];
type ViewMode = 'timeline' | 'calendar';
type SortMode = 'newest' | 'oldest' | 'favorites';

export default function MemoriesScreen() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  // Bulk selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadPosts = useCallback(() => {
    let isActive = true;
    setIsLoading(true);

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

  // Selection mode handlers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const filteredIds = filteredAndSortedPosts.map((p) => p.id);
    setSelectedIds(new Set(filteredIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkFavorite = async () => {
    await bulkAction(Array.from(selectedIds), 'favorite');
    loadPosts();
    showToast({ message: `${selectedIds.size} memories added to favorites`, variant: 'success' });
    clearSelection();
  };

  const handleBulkArchive = async () => {
    await bulkAction(Array.from(selectedIds), 'archive');
    loadPosts();
    showToast({ message: `${selectedIds.size} memories archived`, variant: 'default' });
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await bulkAction(Array.from(selectedIds), 'delete');
    loadPosts();
    showToast({ message: `${selectedIds.size} memories deleted`, variant: 'error' });
    clearSelection();
    setConfirmDelete(false);
  };

  // Filter and sort (no useMemo to avoid React Compiler memoization conflict)
  const filteredAndSortedPosts = (() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = posts.filter((post) => {
      // Category/status filter
      let passesFilter: boolean;
      if (selectedFilter === 'Archived') {
        passesFilter = post.isArchived === true;
      } else if (post.isArchived) {
        passesFilter = false;
      } else if (selectedFilter === 'Favorites') {
        passesFilter = post.isFavorite === true;
      } else if (selectedFilter === 'Pinned') {
        passesFilter = post.isPinned === true;
      } else if (selectedFilter === 'People' || selectedFilter === 'Places' || selectedFilter === 'Events') {
        passesFilter = post.category === selectedFilter;
      } else {
        passesFilter = true;
      }

      if (!passesFilter) return false;

      // Search filter
      if (!query) return true;
      const caption = (post.caption || '').toLowerCase();
      const title = (post.title || '').toLowerCase();
      const prompt = (post.prompt || '').toLowerCase();
      const dateStr = new Date(post.createdAt).toLocaleDateString().toLowerCase();
      const tags = (post.tags || []).join(' ').toLowerCase();
      const location = (post.location || '').toLowerCase();
      return (
        caption.includes(query) ||
        title.includes(query) ||
        prompt.includes(query) ||
        dateStr.includes(query) ||
        tags.includes(query) ||
        location.includes(query)
      );
    });

    if (sortMode === 'oldest') {
      return [...filtered].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    if (sortMode === 'favorites') {
      return [...filtered].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  })();

  // Group by month
  const groupedPosts = useMemo(() => {
    const groups: Record<string, LocalPhotoPost[]> = {};
    for (const post of filteredAndSortedPosts) {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    }

    const entries = Object.entries(groups);
    if (sortMode === 'oldest') {
      entries.sort(([a], [b]) => a.localeCompare(b));
    } else {
      entries.sort(([a], [b]) => b.localeCompare(a));
    }

    return entries.map(([key, items]) => {
      const [year, month] = key.split('-').map(Number);
      const monthTitle = new Date(year, month).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
      return { key, title: monthTitle, items };
    });
  }, [filteredAndSortedPosts, sortMode]);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const memoriesByDate: Record<string, LocalPhotoPost> = {};
    for (const post of posts) {
      if (!post.isArchived) {
        const postDateStr = post.createdAt.slice(0, 10);
        if (!memoriesByDate[postDateStr]) {
          memoriesByDate[postDateStr] = post;
        }
      }
    }

    type CalendarCell = { day: number | null; dateStr: string; memory: LocalPhotoPost | null };
    const grid: CalendarCell[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: null, dateStr: '', memory: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      grid.push({ day: d, dateStr, memory: memoriesByDate[dateStr] || null });
    }

    return grid;
  }, [calendarDate, posts]);

  const monthName = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const nextMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  const prevMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));

  const activePosts = posts.filter((p) => !p.isArchived);
>>>>>>> origin/swish

  const visiblePosts = filter === 'All' || filter === 'Mine' ? posts : [];
  const groupedPosts = view === 'Timeline'
    ? timelineBuckets.map((title) => ({ title, posts: visiblePosts.filter((post) => getTimelineBucket(post.createdAt) === title) }))
    : Array.from(new Set(visiblePosts.map((post) => getMonthLabel(post.createdAt)))).map((title) => ({
        title,
        posts: visiblePosts.filter((post) => getMonthLabel(post.createdAt) === title),
      }));

  return (
    <SafeAreaView style={styles.safeArea}>
<<<<<<< HEAD
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
=======
      <BackgroundPattern />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          title="Memories"
          subtitle={
            activePosts.length > 0
              ? `${activePosts.length} ${activePosts.length === 1 ? 'memory' : 'memories'}`
              : undefined
          }
          rightAction={{
            icon: showSearch ? 'close' : 'search',
            onPress: () => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            },
            accessibilityLabel: showSearch ? 'Close search' : 'Search memories',
          }}
        />

        {showSearch && (
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search memories, tags, locations…"
              autoFocus={true}
              onClear={() => setSearchQuery('')}
              floating
            />
          </View>
        )}

        {/* View mode + Sort toggle */}
        <View style={styles.controlsRow}>
          <View style={styles.viewModeToggle}>
            <Pressable
              onPress={() => setViewMode('timeline')}
              style={[styles.viewModeButton, viewMode === 'timeline' && styles.viewModeButtonActive]}
              accessibilityRole="button"
              accessibilityLabel="Timeline view"
              accessibilityState={{ selected: viewMode === 'timeline' }}
            >
              <Text
                style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}
              >
                Timeline
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('calendar')}
              style={[styles.viewModeButton, viewMode === 'calendar' && styles.viewModeButtonActive]}
              accessibilityRole="button"
              accessibilityLabel="Calendar view"
              accessibilityState={{ selected: viewMode === 'calendar' }}
            >
              <Text
                style={[styles.viewModeText, viewMode === 'calendar' && styles.viewModeTextActive]}
              >
                Calendar
              </Text>
            </Pressable>
          </View>

          {viewMode === 'timeline' && (
            <Pressable
              style={styles.sortButton}
              onPress={() => {
                const modes: SortMode[] = ['newest', 'oldest', 'favorites'];
                const idx = modes.indexOf(sortMode);
                setSortMode(modes[(idx + 1) % modes.length]);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Sort by ${sortMode}. Tap to change.`}
            >
              <Text style={styles.sortButtonText}>
                {sortMode === 'newest' ? '↓ Newest' : sortMode === 'oldest' ? '↑ Oldest' : '⭐ Favs'}
              </Text>
            </Pressable>
          )}

          {!selectionMode ? (
            <Pressable
              style={styles.selectButton}
              onPress={() => setSelectionMode(true)}
              accessibilityRole="button"
              accessibilityLabel="Enter selection mode"
            >
              <Text style={styles.sortButtonText}>Select</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.selectButton, styles.selectButtonActive]}
              onPress={clearSelection}
              accessibilityRole="button"
              accessibilityLabel="Exit selection mode"
            >
              <Text style={[styles.sortButtonText, { color: colors.accent }]}>
                {selectedIds.size > 0 ? `${selectedIds.size} ✓` : 'Done'}
              </Text>
            </Pressable>
          )}
        </View>

        {viewMode === 'timeline' && (
          <>
            <FilterChips
              filters={MEMORY_FILTERS}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />

            {isLoading ? (
              <View style={styles.memoryList}>
                {[0, 1, 2].map((i) => (
                  <SkeletonMemoryCard key={i} aspectRatio={4 / 3} variant="timeline" />
                ))}
              </View>
            ) : groupedPosts.length === 0 ? (
              <EmptyState
                title={
                  searchQuery
                    ? 'No memories found'
                    : selectedFilter === 'Favorites'
                      ? 'No favorites yet'
                      : selectedFilter === 'Archived'
                        ? 'Nothing archived'
                        : selectedFilter === 'Pinned'
                          ? 'No pinned memories'
                          : 'Your memories will live here'
                }
                message={
                  searchQuery
                    ? 'Try searching with different terms.'
                    : selectedFilter === 'Favorites'
                      ? 'Tap the star on any memory to save it here.'
                      : 'Take a photo each day to build your chronological memory journal.'
                }
                variant={
                  searchQuery ? 'search' : selectedFilter === 'Favorites' ? 'star' : selectedFilter === 'Archived' ? 'folder' : selectedFilter === 'Pinned' ? 'star' : 'calendar'
                }
                action={
                  searchQuery || selectedFilter !== 'All'
                    ? undefined
                    : {
                        label: 'Capture a memory',
                        onPress: () => router.push('/(tabs)/create'),
                        variant: 'accent',
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
                    action={
                      selectionMode && !selectedIds.size
                        ? undefined
                        : undefined
                    }
                  />
                  <View style={styles.memoryList}>
                    {group.items.map((post) => (
                      <MemoryCard
                        key={post.id}
                        memory={post}
                        density="timeline"
                        aspectRatio={4 / 3}
                        onPress={() => {
                          if (selectionMode) {
                            toggleSelection(post.id);
                          } else {
                            router.push(`/post/${post.id}`);
                          }
                        }}
                        onLongPress={() => {
                          if (!selectionMode) {
                            setSelectionMode(true);
                          }
                          toggleSelection(post.id);
                        }}
                        showMemoryId={true}
                        showReactions={!selectionMode}
                        showTags={true}
                        onReact={(emoji) => handleReact(post.id, emoji)}
                        isSelected={selectedIds.has(post.id)}
                        selectionMode={selectionMode}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={prevMonth}
                style={styles.navButton}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <Pressable
                onPress={nextMonth}
                style={styles.navButton}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((cell, idx) => (
                <View key={idx} style={styles.calendarCell}>
                  {cell.day !== null ? (
                    cell.memory ? (
                      <Pressable
                        onPress={() => router.push(`/post/${cell.memory!.id}`)}
                        style={styles.memoryTile}
                        accessibilityRole="button"
                        accessibilityLabel={`Memory on ${cell.dateStr}`}
                      >
                        <Image
                          source={{ uri: cell.memory.uri }}
                          style={styles.tileImage}
                          resizeMode="cover"
                        />
                        <View style={styles.tileBadge}>
                          <Text style={styles.tileDayText}>{cell.day}</Text>
                        </View>
                        {cell.memory.isFavorite && (
                          <View style={styles.tileFavDot} />
                        )}
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
>>>>>>> origin/swish
      </ScrollView>

      {/* Bulk Action Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <View style={styles.bulkActionBar}>
          <Button title="Select All" variant="ghost" size="sm" onPress={selectAll} />
          <View style={styles.bulkActions}>
            <Pressable
              style={styles.bulkAction}
              onPress={handleBulkFavorite}
              accessibilityRole="button"
              accessibilityLabel="Favorite selected"
            >
              <Text style={styles.bulkActionIcon}>⭐</Text>
            </Pressable>
            <Pressable
              style={styles.bulkAction}
              onPress={handleBulkArchive}
              accessibilityRole="button"
              accessibilityLabel="Archive selected"
            >
              <Text style={styles.bulkActionIcon}>📦</Text>
            </Pressable>
            <Pressable
              style={[styles.bulkAction, styles.bulkActionDestructive]}
              onPress={() => setConfirmDelete(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete selected"
            >
              <Text style={styles.bulkActionIcon}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete memories?"
        message={`This will permanently delete ${selectedIds.size} ${selectedIds.size === 1 ? 'memory' : 'memories'}. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}

<<<<<<< HEAD
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
=======
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceFloating,
    borderRadius: radius.round,
    padding: 3,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    flex: 1,
  },
  viewModeButton: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    alignItems: 'center',
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
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  selectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  selectButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  sortButtonText: {
    ...typography.sans.caption,
    color: colors.textSecondary,
    fontWeight: '600',
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
  tileFavDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
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
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bottomSpacer: {
    height: 40,
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceModal,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderEmphasized,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulkAction: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  bulkActionDestructive: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  bulkActionIcon: {
    fontSize: 18,
  },
});
>>>>>>> origin/swish
