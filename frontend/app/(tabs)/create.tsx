import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { publishLocalPhoto, type MemoryCategory } from '@/lib/photo-draft';
import { Icon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { TagBadge } from '@/components/ui/TagBadge';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES: MemoryCategory[] = ['General', 'People', 'Places', 'Events'];

type CreateStep = 'landing' | 'details';

export default function CreateScreen() {
  const { showToast } = useToast();
  const [step, setStep] = useState<CreateStep>('landing');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<MemoryCategory>('General');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        setStep('details');
      }
    } catch {
      setErrorMessage('Could not access camera.');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        setStep('details');
      }
    } catch {
      setErrorMessage('Could not open photo library.');
    }
  };

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
    if (!photoUri) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await publishLocalPhoto(
        photoUri,
        caption.trim(),
        undefined,
        category,
        title.trim() || undefined,
        tags,
        location.trim() || undefined,
      );
      showToast({ message: '📸 Memory saved!', variant: 'success', duration: 2000 });
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save memory.');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('landing');
    } else {
      router.back();
    }
  };

  if (step === 'landing') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.screenTitle}>New Memory</Text>
            <View style={{ width: 44 }} />
          </View>

          <Text style={styles.landingQuestion}>What do you want to remember?</Text>

          <View style={styles.landingOptions}>
            <Pressable
              onPress={handleTakePhoto}
              style={styles.optionCard}
              accessibilityRole="button"
              accessibilityLabel="Take a photo"
            >
              <View style={styles.optionIcon}>
                <Icon name="camera" size={28} color={colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take a photo</Text>
                <Text style={styles.optionSubtitle}>Capture the moment now</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={handleChooseFromLibrary}
              style={styles.optionCard}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
            >
              <View style={styles.optionIcon}>
                <Icon name="picture" size={28} color={colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from gallery</Text>
                <Text style={styles.optionSubtitle}>Select an existing photo</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Details step
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.screenTitle}>Add Details</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/create')}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          </View>

          {/* Photo Preview */}
          <View style={styles.photoPreviewContainer}>
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            )}
          </View>

          <Card style={styles.detailsCard} padding="lg">
            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Beach day, Birthday party…"
                style={styles.textInput}
                autoCapitalize="words"
                autoFocus
                maxLength={80}
                returnKeyType="next"
                accessibilityLabel="Memory title"
              />
            </View>

            {/* Caption */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Caption</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="We stayed until sunset…"
                style={[styles.textInput, styles.textInputMultiline]}
                multiline
                maxLength={500}
                textAlignVertical="top"
                accessibilityLabel="Memory caption"
              />
            </View>

            {/* Category */}
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

            {/* Location */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location (optional)</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Paris, France"
                style={styles.textInput}
                autoCapitalize="words"
                maxLength={100}
                returnKeyType="next"
                accessibilityLabel="Memory location"
              />
            </View>

            {/* Tags */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tags (optional)</Text>
              {tags.length > 0 && (
                <View style={styles.tagsList}>
                  {tags.map((tag) => (
                    <TagBadge key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} size="md" />
                  ))}
                </View>
              )}
              <View style={styles.addTagRow}>
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag…"
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

          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <View style={styles.actionButtons}>
            <Button
              title={isSaving ? 'Saving…' : 'Save Memory'}
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

const styles = StyleSheet.create({
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
  retakeText: {
    ...typography.sans.callout,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
  },
  screenTitle: {
    ...typography.sans.headline,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  landingQuestion: {
    ...typography.serif.title,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  landingOptions: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.sans.headline,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    ...typography.sans.subheadline,
    color: colors.textMuted,
    marginTop: 1,
  },
  photoPreviewContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    aspectRatio: 3 / 4,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
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
    borderColor: colors.borderSubtle,
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
  addTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tagInput: {
    flex: 1,
    marginTop: 0,
  },
  addTagButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
  },
  addTagButtonText: {
    fontSize: 24,
    color: colors.textInverse,
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
});
