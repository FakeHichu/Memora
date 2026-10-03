import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getPostsInCollection,
  type LocalCollection,
} from '@/lib/photo-draft';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { SkeletonMemoryCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

const COLLECTION_COLORS = [
  '#7A9FD8', // icy blue
  '#B8A8D8', // lavender
  '#5A8A6E', // sage green
  '#B8A05A', // warm gold
  '#C05A5A', // muted red
  '#8A9AB8', // steel blue
];

export default function CollectionsScreen() {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<LocalCollection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0]);

  const loadCollections = useCallback(() => {
    let isActive = true;
    setIsLoading(true);

    getCollections().then(async (cols) => {
      if (!isActive) return;
      setCollections(cols);

      // Load counts
      const counts: Record<string, number> = {};
      await Promise.all(
        cols.map(async (col) => {
          const posts = await getPostsInCollection(col.id);
          counts[col.id] = posts.length;
        }),
      );
      if (isActive) {
        setCollectionCounts(counts);
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadCollections);

  const openCreate = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setSelectedColor(COLLECTION_COLORS[0]);
    setShowCreateModal(true);
  };

  const openEdit = (col: LocalCollection) => {
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setSelectedColor(col.color || COLLECTION_COLORS[0]);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingCollection) {
      await updateCollection(editingCollection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });
      showToast({ message: 'Collection updated', variant: 'success', duration: 1500 });
    } else {
      await createCollection(name.trim(), description.trim() || undefined, selectedColor);
      showToast({ message: '📁 Collection created', variant: 'success', duration: 1500 });
    }

    setShowCreateModal(false);
    loadCollections();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteCollection(deletingId);
    showToast({ message: 'Collection deleted', variant: 'default', duration: 1500 });
    setDeletingId(null);
    loadCollections();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            variant="overlay"
            size="sm"
            accessibilityLabel="Go back"
          />
          <View style={styles.headerTitle}>
            <Text style={styles.titleEmoji}>📁</Text>
            <Text style={styles.title}>Collections</Text>
          </View>
          <Pressable
            onPress={openCreate}
            style={styles.createBtn}
            accessibilityRole="button"
            accessibilityLabel="Create collection"
          >
            <Text style={styles.createBtnText}>+ New</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.gridItem}>
                <SkeletonMemoryCard variant="compact" aspectRatio={1} />
              </View>
            ))}
          </View>
        ) : collections.length === 0 ? (
          <EmptyState
            title="No collections yet"
            message="Create collections to organize your memories by theme, trip, or event."
            variant="folder"
            action={{
              label: 'Create collection',
              onPress: openCreate,
              variant: 'accent',
            }}
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.grid}>
            {collections.map((col) => (
              <Pressable
                key={col.id}
                style={styles.gridItem}
                onPress={() => router.push(`/collection/${col.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Open collection ${col.name}`}
              >
                <View
                  style={[styles.collectionCard, { borderTopColor: col.color || colors.accent }]}
                >
                  <View style={styles.collectionCardTop}>
                    <Text style={styles.collectionEmoji}>📁</Text>
                    <View style={styles.collectionActions}>
                      <Pressable
                        onPress={() => openEdit(col)}
                        style={styles.miniAction}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${col.name}`}
                        hitSlop={8}
                      >
                        <Text style={styles.miniActionText}>✏️</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setDeletingId(col.id)}
                        style={styles.miniAction}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${col.name}`}
                        hitSlop={8}
                      >
                        <Text style={styles.miniActionText}>🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.collectionName} numberOfLines={2}>{col.name}</Text>
                  {col.description && (
                    <Text style={styles.collectionDesc} numberOfLines={2}>
                      {col.description}
                    </Text>
                  )}
                  <Text style={styles.collectionCount}>
                    {collectionCounts[col.id] ?? 0} memories
                  </Text>
                </View>
              </Pressable>
            ))}

            {/* Create new card */}
            <Pressable
              style={styles.gridItem}
              onPress={openCreate}
              accessibilityRole="button"
              accessibilityLabel="Create new collection"
            >
              <View style={[styles.collectionCard, styles.createCard]}>
                <Text style={styles.createCardIcon}>+</Text>
                <Text style={styles.createCardText}>New Collection</Text>
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            accessibilityViewIsModal
          >
            <Text style={styles.modalTitle}>
              {editingCollection ? 'Edit Collection' : 'New Collection'}
            </Text>

            <Text style={styles.modalFieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Summer Trip 2024"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
              autoFocus
              maxLength={50}
              accessibilityLabel="Collection name"
            />

            <Text style={styles.modalFieldLabel}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="A few words about this collection"
              placeholderTextColor={colors.textMuted}
              style={[styles.modalInput, styles.modalInputMulti]}
              multiline
              maxLength={200}
              accessibilityLabel="Collection description"
            />

            <Text style={styles.modalFieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLLECTION_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Color ${color}`}
                  accessibilityState={{ selected: selectedColor === color }}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCreateModal(false)}
              />
              <Button
                title={editingCollection ? 'Save Changes' : 'Create'}
                variant="accent"
                onPress={handleSave}
                disabled={!name.trim()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        visible={deletingId !== null}
        title="Delete Collection?"
        message="This will remove the collection. Memories inside won't be deleted — they'll just be unassigned."
        confirmLabel="Delete Collection"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleEmoji: { fontSize: 22 },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  createBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: colors.accent,
  },
  createBtnText: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  grid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  gridItem: {
    width: '47%',
  },
  collectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderTopWidth: 3,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  collectionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  collectionEmoji: {
    fontSize: 28,
  },
  collectionActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  miniAction: {
    padding: 2,
  },
  miniActionText: {
    fontSize: 14,
  },
  collectionName: {
    ...typography.sans.headline,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  collectionDesc: {
    ...typography.sans.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  collectionCount: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 'auto' as unknown as number,
  },
  createCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElevated,
    borderStyle: 'dashed',
    borderTopWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  createCardIcon: {
    fontSize: 32,
    color: colors.textMuted,
    fontWeight: '300',
  },
  createCardText: {
    ...typography.sans.callout,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 8, 12, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surfaceModal,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: borders.hairline,
    borderColor: colors.borderEmphasized,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalFieldLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
  },
  modalInputMulti: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
  },
  colorSwatchSelected: {
    borderWidth: borders.medium,
    borderColor: colors.textPrimary,
    transform: [{ scale: 1.15 }],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
