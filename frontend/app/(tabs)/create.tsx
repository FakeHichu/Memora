import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { radius, spacing, typography, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { publishLocalPhoto } from '@/lib/photo-draft';
import { Icon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useUnifiedCircle } from '@/contexts/CircleContext';
import { postMemoryToCircle } from '@/lib/photo-upload';

export default function CreateScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);
  const { showToast } = useToast();
  const { activeCircle, circles, selectCircle } = useUnifiedCircle();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCirclePicker, setShowCirclePicker] = useState(false);

  const handlePickImage = async () => {
    Alert.alert('Upload Photo', 'Choose photo source', [
      {
        text: 'Take Photo',
        onPress: async () => {
          try {
            const { granted } = await ImagePicker.requestCameraPermissionsAsync();
            if (!granted) {
              Alert.alert('Permission needed', 'Camera permission is required.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!res.canceled && res.assets[0]?.uri) {
              setPhotoUri(res.assets[0].uri);
            }
          } catch (e) {
            console.error('Camera error:', e);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          try {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!res.canceled && res.assets[0]?.uri) {
              setPhotoUri(res.assets[0].uri);
            }
          } catch (e) {
            console.error('Gallery error:', e);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleShareMemory = async () => {
    if (!photoUri) {
      showToast({ message: 'Please select a photo first', variant: 'warning' });
      return;
    }

    setIsUploading(true);
    try {
      if (activeCircle?.id) {
        try {
          await postMemoryToCircle(activeCircle.id, photoUri, caption.trim());
        } catch {
          // Fallback to local
          await publishLocalPhoto(
            photoUri,
            caption.trim() || 'Circle Memory',
            undefined,
            'General',
            caption.trim() || 'Circle Memory'
          );
        }
      } else {
        await publishLocalPhoto(
          photoUri,
          caption.trim() || 'Memory',
          undefined,
          'General',
          caption.trim() || 'Memory'
        );
      }

      showToast({ message: 'Memory shared successfully!', variant: 'success' });
      setPhotoUri(null);
      setCaption('');
      router.push('/(tabs)/home');
    } catch {
      showToast({ message: 'Failed to share memory', variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={12}
              accessibilityLabel="Back"
            >
              <Icon name="arrow-left" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Upload Memory</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Photo Dropzone / Selection Box */}
          <Pressable
            onPress={handlePickImage}
            style={[
              styles.dropzone,
              photoUri ? styles.dropzoneFilled : styles.dropzoneDashed,
            ]}
          >
            {photoUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.changeBadge}>
                  <Icon name="camera" size={14} color="#FFFFFF" />
                  <Text style={styles.changeBadgeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.dropzoneInner}>
                <View style={styles.iconCircle}>
                  <Icon name="picture" size={32} color={colors.accent} />
                </View>
                <Text style={styles.dropzoneTitle}>Select a photo</Text>
                <Text style={styles.dropzoneSubtitle}>or drag and drop</Text>
              </View>
            )}
          </Pressable>

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={colors.textMuted}
              style={styles.captionInput}
              multiline
              maxLength={400}
              textAlignVertical="top"
            />
          </View>

          {/* Select Circle Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Circle</Text>
            <Pressable
              style={styles.circleSelectorCard}
              onPress={() => setShowCirclePicker(!showCirclePicker)}
            >
              <View style={styles.circleAvatar}>
                <Icon name="users" size={18} color={colors.accent} />
              </View>
              <View style={styles.circleDetails}>
                <Text style={styles.circleName}>
                  {activeCircle?.name || 'Cyber Security 2026'}
                </Text>
                <Text style={styles.circleMembers}>
                  {activeCircle?.memberCount || 24} members
                </Text>
              </View>
              <Icon
                name={showCirclePicker ? 'close' : 'chevron-right'}
                size={16}
                color={colors.textMuted}
              />
            </Pressable>

            {/* Dropdown if picker is toggled */}
            {showCirclePicker && circles.length > 1 && (
              <View style={styles.circleDropdown}>
                {circles.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      selectCircle(c.id);
                      setShowCirclePicker(false);
                    }}
                    style={[
                      styles.circleDropdownItem,
                      c.id === activeCircle?.id && styles.circleDropdownItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        c.id === activeCircle?.id && styles.dropdownItemTextActive,
                      ]}
                    >
                      {c.name} ({c.memberCount} members)
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Share Memory Button */}
          <Pressable
            onPress={handleShareMemory}
            disabled={isUploading || !photoUri}
            style={({ pressed }) => [
              styles.shareButton,
              (!photoUri || isUploading) && styles.shareButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.crust} size="small" />
            ) : (
              <Text style={styles.shareButtonText}>Share Memory</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    backButton: {
      padding: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dropzone: {
      width: '100%',
      height: 220,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    dropzoneDashed: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: isDark ? colors.surface2 : colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropzoneFilled: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropzoneInner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? colors.surface1 : colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    dropzoneTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    dropzoneSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    previewContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    changeBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    changeBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    captionContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      minHeight: 100,
    },
    captionInput: {
      fontSize: 15,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    section: {
      gap: 8,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginLeft: 4,
    },
    circleSelectorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 12,
    },
    circleAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: isDark ? colors.surface1 : colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleDetails: {
      flex: 1,
    },
    circleName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    circleMembers: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    circleDropdown: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 6,
      overflow: 'hidden',
    },
    circleDropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    circleDropdownItemActive: {
      backgroundColor: colors.surface1,
    },
    dropdownItemText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    dropdownItemTextActive: {
      fontWeight: '700',
      color: colors.accent,
    },
    shareButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 6px 20px rgba(180, 190, 254, 0.3)'
              : '0 6px 20px rgba(114, 135, 253, 0.25)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    shareButtonDisabled: {
      opacity: 0.5,
    },
    shareButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.crust,
    },
    buttonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
  });
}
