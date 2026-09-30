import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';
import { clearLocalPhotoPosts, getLocalPhotoPosts } from '@/lib/photo-draft';

export default function ProfileScreen() {
  const [photoCount, setPhotoCount] = useState(0);

  const refreshPhotoCount = useCallback(() => {
    getLocalPhotoPosts().then((posts) => setPhotoCount(posts.length));
  }, []);

  useFocusEffect(refreshPhotoCount);

  const confirmClearPhotos = () => {
    Alert.alert('Delete all photos?', 'This permanently removes the photos saved in this app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete photos',
        style: 'destructive',
        onPress: () => {
          clearLocalPhotoPosts().then(() => setPhotoCount(0));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo storage</Text>
          <Text style={styles.value}>{photoCount} {photoCount === 1 ? 'photo' : 'photos'} saved</Text>
          <Text style={styles.description}>Photos are stored privately on this device. They are not uploaded or shared.</Text>
        </View>

        {photoCount > 0 ? (
          <Pressable onPress={confirmClearPhotos} accessibilityRole="button" style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete all photos</Text>
          </Pressable>
        ) : null}
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
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  section: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    color: colors.muted,
    lineHeight: 21,
  },
  deleteButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
  },
  deleteText: {
    color: colors.error,
    fontWeight: '700',
  },
});
