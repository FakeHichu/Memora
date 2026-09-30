import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';
import { setPhotoDraft } from '@/lib/photo-draft';

export default function CameraIndexScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capturePhoto = async () => {
    if (!cameraReady || isTakingPhoto) return;

    setIsTakingPhoto(true);
    setErrorMessage(null);

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
      if (!photo?.uri) throw new Error('The camera did not return a photo.');

      setPhotoDraft(photo.uri);
      router.replace('/camera/preview');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not take the photo.');
      setIsTakingPhoto(false);
    }
  };

  const chooseFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      const selectedUri = result.assets?.[0]?.uri;

      if (!result.canceled && selectedUri) {
        setPhotoDraft(selectedUri);
        router.replace('/camera/preview');
      }
    } catch {
      setErrorMessage('Could not open your photo library.');
    }
  };

  if (!permission) {
    return <View style={styles.permissionScreen}><Text style={styles.permissionText}>Checking camera access…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>Allow camera access to take today’s class photo.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelText}>Not now</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
        onMountError={({ message }) => setErrorMessage(message)}
      />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable style={styles.topControl} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close camera">
            <Text style={styles.topControlText}>Close</Text>
          </Pressable>
          <Text style={styles.cameraLabel}>TODAY’S PROMPT</Text>
          <Pressable
            style={styles.topControl}
            onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')}
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
          >
            <Text style={styles.topControlText}>Flip</Text>
          </Pressable>
        </View>

        <View style={styles.bottomControls}>
          <Text style={styles.prompt}>Show us something interesting you saw today.</Text>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Pressable
            style={[styles.shutterOuter, (!cameraReady || isTakingPhoto) && styles.shutterDisabled]}
            onPress={capturePhoto}
            disabled={!cameraReady || isTakingPhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable onPress={chooseFromLibrary} style={styles.libraryButton} accessibilityRole="button">
            <Text style={styles.libraryButtonText}>Choose from library</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080808',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topControl: {
    minWidth: 56,
    minHeight: 44,
    justifyContent: 'center',
  },
  topControlText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cameraLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  prompt: {
    maxWidth: 300,
    marginBottom: spacing.xl,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 38,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  libraryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  libraryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    marginBottom: spacing.md,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  permissionButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelText: {
    padding: spacing.md,
    color: colors.text,
    fontWeight: '600',
  },
});