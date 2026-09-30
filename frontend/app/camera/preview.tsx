import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { clearPhotoDraft, getPhotoDraft, publishLocalPhoto } from '@/lib/photo-draft';

export default function CameraPreviewScreen() {
  const [photoUri] = useState(() => getPhotoDraft());
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
      await publishLocalPhoto(photoUri, caption.trim());
      router.replace('/(tabs)/today');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your photo.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={retake} accessibilityRole="button" accessibilityLabel="Retake photo">
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Text style={styles.kicker}>PHOTO PREVIEW</Text>
          <View style={styles.headerSpacer} />
        </View>

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Captured photo preview" />
        ) : (
          <View style={[styles.photo, styles.emptyPhoto]}>
            <Text style={styles.emptyText}>No photo captured</Text>
          </View>
        )}

        <View style={styles.promptRow}>
          <View style={styles.promptDot} />
          <Text style={styles.prompt}>Show us something interesting you saw today.</Text>
        </View>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a caption..."
          placeholderTextColor={colors.muted}
          maxLength={280}
          multiline
          style={styles.captionInput}
          accessibilityLabel="Photo caption"
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Button title="Retake" variant="secondary" onPress={retake} style={styles.actionButton} disabled={isSaving} />
          <Pressable
            onPress={postPhoto}
            disabled={!photoUri || isSaving}
            accessibilityRole="button"
            accessibilityLabel="Post photo"
            style={[styles.postButton, (!photoUri || isSaving) && styles.disabledButton]}
          >
            <Text style={styles.postButtonText}>{isSaving ? 'Saving…' : 'Post'}</Text>
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
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retakeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  kicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 48,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 520,
    borderRadius: radius.lg,
    backgroundColor: '#171717',
  },
  emptyPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  promptDot: {
    width: 9,
    height: 9,
    marginTop: 6,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  prompt: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  captionInput: {
    minHeight: 52,
    maxHeight: 120,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  errorMessage: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  postButton: {
    flex: 1.4,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.55,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});