import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icons';
import { EmptyState } from '@/components/ui/EmptyState';

type NotificationType = 'photo' | 'comment' | 'reaction' | 'mention';

type NotificationItem = {
  id: string;
  type: NotificationType;
  actorName: string;
  avatarUri?: string;
  actionText: string;
  previewText?: string;
  photoThumbnail?: string;
  timestamp: string;
  isUnread: boolean;
  postId?: string;
};

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'photo',
    actorName: 'Sarah',
    actionText: 'shared a new photo',
    photoThumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop',
    timestamp: '2m ago',
    isUnread: true,
  },
  {
    id: 'notif-2',
    type: 'comment',
    actorName: 'Alex',
    actionText: 'commented',
    previewText: '"This is amazing!"',
    timestamp: '5m ago',
    isUnread: true,
  },
  {
    id: 'notif-3',
    type: 'reaction',
    actorName: 'Priya',
    actionText: 'reacted ❤️',
    timestamp: '10m ago',
    isUnread: false,
  },
  {
    id: 'notif-4',
    type: 'mention',
    actorName: 'You',
    actionText: 'were mentioned in a post',
    timestamp: '12m ago',
    isUnread: false,
  },
];

export default function NotificationsScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Mentions' | 'Activity'>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'Mentions') return item.type === 'mention';
    if (activeFilter === 'Activity') return item.type === 'reaction' || item.type === 'comment' || item.type === 'photo';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header matching Screen 13 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs: All | Mentions | Activity */}
      <View style={styles.filterRow}>
        {(['All', 'Mentions', 'Activity'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No Notifications Yet"
            message="When classmates interact with your memories, you'll see it here."
            variant="bell"
            style={{ marginTop: 60 }}
          />
        ) : (
          filteredNotifications.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.itemRow,
                item.isUnread && styles.itemRowUnread,
              ]}
              onPress={() => {
                // Mark as read
                setNotifications((prev) =>
                  prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
                );
                router.push('/(tabs)/home');
              }}
            >
              <Avatar name={item.actorName} size={44} ring={item.isUnread} photoUri={item.avatarUri} />

              <View style={styles.itemContent}>
                <Text style={styles.itemText} numberOfLines={2}>
                  <Text style={styles.actorName}>{item.actorName} </Text>
                  {item.actionText}
                  {item.previewText ? (
                    <Text style={styles.previewText}> {item.previewText}</Text>
                  ) : null}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>

              {/* Thumbnail preview or unread dot */}
              {item.photoThumbnail ? (
                <Image
                  source={{ uri: item.photoThumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : item.isUnread ? (
                <View style={styles.unreadDot} />
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    backButton: {
      padding: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterTextActive: {
      color: colors.crust,
      fontWeight: '700',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 14,
    },
    itemRowUnread: {
      backgroundColor: 'transparent',
    },
    itemContent: {
      flex: 1,
      gap: 4,
    },
    actorName: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    itemText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    previewText: {
      fontStyle: 'italic',
      color: colors.textPrimary,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textMuted,
    },
    thumbnail: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.card,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
  });
}
