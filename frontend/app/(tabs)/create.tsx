import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { setPhotoDraft } from '@/lib/photo-draft';
import { Icon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

type CreateStep = 'landing' | 'photo' | 'details';

export default function CreateScreen() {
  const [step, setStep] = useState<CreateStep>('landing');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
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

  const handleRetake = () => {
    setPhotoUri(null);
    setStep('photo');
  };

  const handleSave = async () => {
    if (!photoUri) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      setPhotoDraft(photoUri);
      router.replace('/camera/preview');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save memory.');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('photo');
    } else if (step === 'photo') {
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
          <View style={styles.landingContainer}>
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
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'photo') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} accessibilityLabel="Back">
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.stepLabel}>Add a photo</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.photoPreviewContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.emptyPhoto}>
                <Text style={styles.emptyPhotoText}>No photo selected</Text>
              </View>
            )}
          </View>

          <View style={styles.photoOptions}>
            <Button
              title="Take a photo"
              variant="primary"
              onPress={handleTakePhoto}
              size="lg"
              fullWidth
            />
            <Button
              title="Choose from gallery"
              variant="secondary"
              onPress={handleChooseFromLibrary}
              size="lg"
              fullWidth
            />
          </View>

          {photoUri && (
            <Button
              title="Next: Add details"
              variant="accent"
              onPress={() => setStep('details')}
              size="lg"
              fullWidth
              style={styles.nextButton}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Details step
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} accessibilityLabel="Back">
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.stepLabel}>Add details</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.photoPreviewContainer}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
          )}
        </View>

        <Card style={styles.detailsCard} padding="lg">
          <Text style={styles.fieldLabel}>Give this memory a name</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Beach day"
            style={styles.textInput}
            autoCapitalize="words"
            autoFocus
            maxLength={50}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Tell the story</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="We stayed until sunset..."
            style={[styles.textInput, styles.textInputMultiline, { minHeight: 100 }]}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </Card>

        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        <View style={styles.actionButtons}>
          <Button title="Retake photo" variant="ghost" onPress={handleRetake} fullWidth />
          <Button
            title={isSaving ? 'Saving…' : 'Save memory'}
            variant="accent"
            onPress={handleSave}
            disabled={isSaving || !title.trim()}
            fullWidth
            size="lg"
          />
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
  },
  backText: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  stepLabel: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  landingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.xl,
  },
  landingQuestion: {
    ...typography.serif.title,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
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
    borderColor: colors.borderChrome,
    gap: spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
      },
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
  optionIconText: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    ...typography.subheadline,
    color: colors.textMuted,
    marginTop: 1,
  },
  photoPreviewContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    aspectRatio: 3 / 4,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  emptyPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  emptyPhotoText: {
    ...typography.body,
    color: colors.textMuted,
  },
  photoOptions: {
    gap: spacing.md,
  },
  nextButton: {
    marginTop: spacing.sm,
  },
  detailsCard: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
    borderRadius: radius.md,
    color: colors.textPrimary,
    ...typography.body,
  },
  textInputMultiline: {
    paddingTop: spacing.md,
  },
  errorMessage: {
    ...typography.footnote,
    color: colors.error,
    marginTop: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
