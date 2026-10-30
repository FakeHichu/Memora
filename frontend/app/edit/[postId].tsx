import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { getLocalPhotoPost, updateLocalPhotoPost, type LocalPhotoPost, type MemoryCategory } from '@/lib/photo-draft';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const CATEGORIES: MemoryCategory[] = ['General', 'People', 'Places', 'Events'];

export default function EditMemoryScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [post, setPost] = useState<LocalPhotoPost | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('General');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPost = useCallback(() => {
    let isActive = true;
    getLocalPhotoPost(postId as string).then((savedPost) => {
      if (!isActive) return;
      setPost(savedPost);
      if (savedPost) {
        setTitle(savedPost.title || '');
        setCaption(savedPost.caption || '');
        setCategory(savedPost.category || 'General');
        setLocation(savedPost.location || '');
        setTags(savedPost.tags || []);
      }
    });
    return () => {
      isActive = false;
    };
  }, [postId]);

  useFocusEffect(loadPost);

  const handleAddTag = () => {
    const normalized = newTag.toLowerCase().trim();
    if (!normalized || tags.includes(normalized) || tags.length >= 10) return;
    setTags((prev) => [...prev, normalized]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!post) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateLocalPhotoPost(post.id, {
        title: title.trim() || undefined,
        caption: caption.trim(),
        category,
        location: location.trim() || undefined,
        tags,
      });
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your changes.');
      setIsSaving(false);
    }
  };

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Loading this memory…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.screenTitle}>Edit Memory</Text>
            <View style={styles.backButton} />
          </View>

          {post.uri ? (
            <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" />
          ) : null}

          <Card style={styles.detailsCard} padding="lg">
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Beach day, Birthday party…"
                placeholderTextColor={colors.textMuted}
                style={styles.textInput}
                autoCapitalize="words"
                maxLength={80}
                returnKeyType="next"
                accessibilityLabel="Memory title"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Caption</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="We stayed until sunset…"
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, styles.textInputMultiline]}
                multiline
                maxLength={500}
                textAlignVertical="top"
                accessibilityLabel="Memory caption"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                    accessibilityRole="radio"
                    accessibilityLabel={cat}
                    accessibilityState={{ selected: category === cat }}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        category === cat && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location (optional)</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Paris, France"
                placeholderTextColor={colors.textMuted}
                style={styles.textInput}
                autoCapitalize="words"
                maxLength={100}
                returnKeyType="next"
                accessibilityLabel="Memory location"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tags (optional)</Text>
              {tags.length > 0 && (
                <View style={styles.tagsList}>
                  {tags.map((tag) => (
                    <Pressable
                      key={tag}
                      onPress={() => handleRemoveTag(tag)}
                      style={styles.tagChip}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove tag ${tag}`}
                    >
                      <Text style={styles.tagChipText}>#{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.addTagRow}>
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag…"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, styles.tagInput]}
                  autoCapitalize="none"
                  maxLength={30}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                  accessibilityLabel="Add tag"
                />
                <Pressable
                  onPress={handleAddTag}
                  style={styles.addTagButton}
                  disabled={!newTag.trim() || tags.length >= 10}
                  accessibilityRole="button"
                  accessibilityLabel="Add tag"
                >
                  <Text style={styles.addTagButtonText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.tagHint}>{tags.length}/10 tags</Text>
            </View>
          </Card>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <View style={styles.actionButtons}>
            <Button
              title={isSaving ? 'Saving…' : 'Save Changes'}
              variant="accent"
              onPress={handleSave}
              disabled={isSaving}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    backButton: {
      padding: spacing.xs,
      minWidth: 44,
    },
    backText: {
      ...typography.sans.callout,
      color: colors.accent,
      fontWeight: '600',
    },
    screenTitle: {
      ...typography.sans.headline,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    photo: {
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: radius.lg,
      backgroundColor: colors.backgroundElevated,
    },
    detailsCard: {
      gap: spacing.md,
    },
    field: {
      gap: spacing.xs,
    },
    fieldLabel: {
      ...typography.sans.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    textInput: {
      marginTop: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.backgroundElevated,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      borderRadius: radius.md,
      color: colors.textPrimary,
      ...typography.sans.body,
    },
    textInputMultiline: {
      paddingTop: spacing.md,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    categoryPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.xs,
    } as any,
    categoryPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      backgroundColor: colors.backgroundElevated,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    categoryPillActive: {
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
    },
    categoryPillText: {
      ...typography.sans.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    categoryPillTextActive: {
      color: colors.accent,
      fontWeight: '700',
    },
    tagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    tagChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.round,
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.hairline,
      borderColor: colors.accent,
    },
    tagChipText: {
      ...typography.sans.caption,
      color: colors.accent,
      fontWeight: '700',
    },
    addTagRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    tagInput: {
      flex: 1,
    },
    addTagButton: {
      width: 40,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: radius.md,
    },
    addTagButtonText: {
      fontSize: 24,
      color: colors.textOnPrimary,
      fontWeight: '700',
      lineHeight: 28,
    },
    tagHint: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      marginTop: 2,
    },
    errorMessage: {
      ...typography.sans.footnote,
      color: colors.error,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'column',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    stateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    stateText: {
      ...typography.sans.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
