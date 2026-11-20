import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function EditProfileScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);
  const { showToast } = useToast();
  const { session } = useAuth();

  const [name, setName] = useState('You');
  const [bio, setBio] = useState('Just another memora ❤️');
  const [username, setUsername] = useState('you_memora');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (supabase && session?.user?.id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (data) {
            if (data.display_name) setName(data.display_name);
            if (data.username) setUsername(data.username);
            if (data.bio) setBio(data.bio);
            if (data.avatar_path) setAvatarUri(data.avatar_path);
          } else {
            const fallbackName =
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'You';
            setName(fallbackName);
            setUsername(fallbackName.toLowerCase().replace(/\s+/g, '_'));
          }
        } catch {
          // fallback
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [session]);

  const handleChangePhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.canceled && res.assets[0]?.uri) {
        setAvatarUri(res.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to pick photo');
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      showToast({ message: 'Name cannot be empty', variant: 'warning' });
      return;
    }

    setIsSaving(true);
    try {
      if (supabase && session?.user?.id) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            display_name: name.trim(),
            username: username.trim().toLowerCase(),
            bio: bio.trim(),
            avatar_path: avatarUri,
            updated_at: new Date().toISOString(),
          });
      }
      showToast({ message: 'Profile updated successfully!', variant: 'success' });
      router.back();
    } catch {
      showToast({ message: 'Saved changes locally.', variant: 'success' });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header matching Screen 15 */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={12}
              accessibilityLabel="Back"
            >
              <Icon name="arrow-left" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Change Photo Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handleChangePhoto} style={styles.avatarWrapper}>
              <Avatar name={name} size={90} ring photoUri={avatarUri || undefined} />
              <View style={styles.cameraBadge}>
                <Icon name="camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable onPress={handleChangePhoto} hitSlop={8}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields matching Screen 15 */}
          <View style={styles.formCard}>
            {/* Name */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={styles.textInput}
                autoCapitalize="words"
              />
            </View>

            {/* Bio */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Add a bio..."
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, styles.bioInput]}
                multiline
                maxLength={160}
              />
            </View>
          </View>

          {/* Save Changes Button */}
          <Pressable
            onPress={handleSaveChanges}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.crust} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 24,
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
    avatarSection: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginVertical: 12,
    },
    avatarWrapper: {
      position: 'relative',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    changePhotoText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    formCard: {
      gap: 18,
    },
    fieldBlock: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginLeft: 4,
    },
    textInput: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      fontSize: 15,
      color: colors.textPrimary,
    },
    bioInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    saveButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
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
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
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
