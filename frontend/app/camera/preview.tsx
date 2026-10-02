import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import {
  clearPhotoDraft,
  getPhotoDraft,
  getPromptDraft,
  publishLocalPhoto,
  type MemoryCategory,
} from '@/lib/photo-draft';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { defaultPrompts } from '@/constants/prompts';

const CATEGORIES: MemoryCategory[] = ['General', 'People', 'Places', 'Events'];

export default function CameraPreviewScreen() {
  const [photoUri] = useState(() => getPhotoDraft());
  const [prompt] = useState(() => {
    const draftPrompt = getPromptDraft();
    if (draftPrompt) return draftPrompt;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    return defaultPrompts[dayOfYear % defaultPrompts.length];
  });
  const [category, setCategory] = useState<MemoryCategory>('General');
  const [caption, setCaption] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const retake = () => {
    clearPhotoDraft();
    router.replace('/camera');
  };

  const postPhoto = async () => {
    if (!photoUri) {
      setErrorMessage('Take a photo before posting.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await publishLocalPhoto(photoUri, caption.trim(), prompt, category);
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your photo.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={retake} accessibilityRole="button" accessibilityLabel="Retake photo">
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Text style={styles.kicker}>PHOTO PREVIEW</Text>
          <View style={styles.headerSpacer} />
        </View>

        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel="Captured photo preview"
          />
        ) : (
          <View style={[styles.photo, styles.emptyPhoto]}>
            <Text style={styles.emptyText}>No photo captured</Text>
          </View>
        )}

        <View style={styles.promptRow}>
          <View style={styles.promptDot} />
          <Text style={styles.prompt}>{prompt}</Text>
        </View>

        {/* Category selector */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>CATEGORY</Text>
          <View style={styles.categoryPills}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
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

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a caption to preserve this moment..."
          placeholderTextColor={colors.textMuted}
          maxLength={280}
          multiline
          style={styles.captionInput}
          accessibilityLabel="Photo caption"
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Button
            title="Retake"
            variant="secondary"
            onPress={retake}
            style={styles.actionButton}
            disabled={isSaving}
          />
          <Pressable
            onPress={postPhoto}
            disabled={!photoUri || isSaving}
            accessibilityRole="button"
            accessibilityLabel="Post photo"
            style={[styles.postButton, (!photoUri || isSaving) && styles.disabledButton]}
          >
            <Text style={styles.postButtonText}>{isSaving ? 'Saving…' : 'Post Memory'}</Text>
          </Pressable>
        </View>
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retakeText: {
    ...typography.sans.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  kicker: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 1.1,
  },
  headerSpacer: {
    width: 48,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.xl,
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  emptyPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  prompt: {
    ...typography.sans.subheadline,
    color: colors.textPrimary,
    flex: 1,
    fontStyle: 'italic',
  },
  categoryRow: {
    gap: spacing.xs,
  },
  categoryLabel: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  categoryPills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  categoryPillActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  categoryPillText: {
    ...typography.sans.caption2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  captionInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
    minHeight: 80,
  },
  errorMessage: {
    ...typography.sans.caption,
    color: colors.error,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  postButton: {
    flex: 2,
    backgroundColor: colors.accent,
    borderRadius: radius.round,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    ...typography.sans.headline,
    color: colors.textInverse,
  },
  disabledButton: {
    opacity: 0.5,
  },
});