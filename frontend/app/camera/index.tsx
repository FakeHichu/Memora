import { CameraView, useCameraPermissions, type FlashMode } from 'expo-camera';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

<<<<<<< HEAD
import { spacing, type ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, setPhotoDraft } from '@/lib/photo-draft';
import { useAppTheme } from '@/providers/ThemeProvider';
=======
import { colors, spacing, typography, radius } from '@/constants/theme';
import { setPhotoDraft } from '@/lib/photo-draft';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
>>>>>>> origin/swish

export default function CameraIndexScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 10>(0);
  const [showGrid, setShowGrid] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestPhotoUri, setLatestPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getLocalPhotoPosts()
      .then((posts) => {
        if (isActive) setLatestPhotoUri(posts[0]?.uri ?? null);
      })
      .catch(() => {
        if (isActive) setLatestPhotoUri(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const capturePhoto = async () => {
    if (!cameraReady || isTakingPhoto) return;

    setIsTakingPhoto(true);
    setErrorMessage(null);

    try {
      for (let remaining = timerSeconds; remaining > 0; remaining -= 1) {
        setCountdown(remaining);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setCountdown(null);
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.92 });
      if (!photo?.uri) throw new Error('The camera did not return a photo.');

      setPhotoDraft(photo.uri);
      router.replace('/camera/preview');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not take the photo.');
      setIsTakingPhoto(false);
      setCountdown(null);
    }
  };

  const chooseFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
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
    return (
      <View style={styles.permissionScreen}>
<<<<<<< HEAD
        <Text style={styles.permissionEyebrow}>MEMORA CAMERA</Text>
        <Text style={styles.permissionText}>Preparing your camera…</Text>
=======
        <Text style={styles.permissionText}>Checking camera access…</Text>
>>>>>>> origin/swish
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
<<<<<<< HEAD
        <View style={styles.permissionMark}><Text style={styles.permissionMarkText}>M</Text></View>
        <Text style={styles.permissionEyebrow}>MAKE A MOMENT</Text>
        <Text style={styles.permissionTitle}>Your camera is waiting.</Text>
        <Text style={styles.permissionText}>Allow camera access to take a photo for today’s journal.</Text>
=======
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>Allow camera access to take today's photo.</Text>
>>>>>>> origin/swish
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Enable camera</Text>
        </Pressable>
        <Pressable style={styles.permissionCancel} onPress={() => router.back()}>
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
        flash={flash}
        zoom={zoom}
        onCameraReady={() => setCameraReady(true)}
        onMountError={({ message }) => {
          setErrorMessage(message);
          setCameraReady(false);
        }}
      />
      <BackgroundPattern />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
<<<<<<< HEAD
            style={styles.roundControl}
            onPress={() => router.back()}
            disabled={isTakingPhoto}
=======
            style={styles.topControl}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close camera"
          >
            <Text style={styles.topControlText}>Close</Text>
          </Pressable>
          <Text style={styles.cameraLabel}>TODAY'S PROMPT</Text>
          <Pressable
            style={styles.topControl}
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
>>>>>>> origin/swish
            accessibilityRole="button"
            accessibilityLabel="Close camera"
          >
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>MEMORA</Text>
            <Text style={styles.brandSubtitle}>CAMERA</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              style={[styles.roundControl, showGrid && styles.roundControlActive]}
              onPress={() => setShowGrid((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={showGrid ? 'Hide composition grid' : 'Show composition grid'}
              accessibilityState={{ selected: showGrid }}
            >
              <Text style={styles.gridIcon}>▦</Text>
            </Pressable>
            <Pressable
              style={styles.flashControl}
              onPress={() => setFlash((current) => current === 'off' ? 'auto' : current === 'auto' ? 'on' : 'off')}
              accessibilityRole="button"
              accessibilityLabel={`Flash ${flash}`}
            >
              <Text style={styles.flashIcon}>ϟ</Text>
              <Text style={styles.flashLabel}>{flash === 'off' ? 'OFF' : flash.toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.promptCard}>
            <View style={styles.promptHeading}>
              <View style={styles.promptDot} />
              <Text style={styles.promptLabel}>TODAY’S PROMPT</Text>
            </View>
            <Text style={styles.prompt}>Show us something interesting you saw today.</Text>
          </View>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
<<<<<<< HEAD

          <View style={styles.zoomControls} accessibilityLabel="Zoom level">
            {[
              { label: '1×', value: 0 },
              { label: '2×', value: 0.35 },
              { label: '3×', value: 0.65 },
            ].map((option) => (
              <Pressable
                key={option.label}
                style={[styles.zoomOption, zoom === option.value && styles.zoomOptionActive]}
                onPress={() => setZoom(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Zoom ${option.label}`}
                accessibilityState={{ selected: zoom === option.value }}
              >
                <Text style={[styles.zoomText, zoom === option.value && styles.zoomTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.timerControls}>
            <Text style={styles.timerLabel}>TIMER</Text>
            {([0, 3, 10] as const).map((seconds) => (
              <Pressable
                key={seconds}
                style={[styles.timerOption, timerSeconds === seconds && styles.timerOptionActive]}
                onPress={() => setTimerSeconds(seconds)}
                disabled={isTakingPhoto}
                accessibilityRole="button"
                accessibilityLabel={seconds === 0 ? 'Timer off' : `${seconds} second timer`}
                accessibilityState={{ selected: timerSeconds === seconds }}
              >
                <Text style={[styles.timerText, timerSeconds === seconds && styles.timerTextActive]}>
                  {seconds === 0 ? 'OFF' : `${seconds}s`}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.captureRow}>
            <Pressable
              style={styles.sideControl}
              onPress={chooseFromLibrary}
              accessibilityRole="button"
              accessibilityLabel="Open photo library"
            >
              {latestPhotoUri ? (
                <Image source={{ uri: latestPhotoUri }} style={styles.latestPhoto} />
              ) : (
                <Text style={styles.libraryIcon}>LIB</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.shutterOuter, (!cameraReady || isTakingPhoto) && styles.shutterDisabled]}
              onPress={capturePhoto}
              disabled={!cameraReady || isTakingPhoto}
              accessibilityRole="button"
              accessibilityLabel={isTakingPhoto ? 'Taking photo' : 'Take photo'}
            >
              <View style={styles.shutterInner} />
            </Pressable>

            <Pressable
              style={styles.sideControl}
              onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')}
              disabled={isTakingPhoto}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}
            >
              <Text style={styles.flipIcon}>↻</Text>
            </Pressable>
          </View>

          <Text style={styles.modeLabel}>{countdown !== null ? `CAPTURING IN ${countdown}` : 'PHOTO  ·  TODAY'}</Text>
          {!cameraReady && !errorMessage ? <Text style={styles.loadingLabel}>Waking up the camera…</Text> : null}
=======
          <Pressable
            style={[styles.shutterOuter, (!cameraReady || isTakingPhoto) && styles.shutterDisabled]}
            onPress={capturePhoto}
            disabled={!cameraReady || isTakingPhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
            {cameraReady && !isTakingPhoto && <View style={styles.shutterGlow} />}
          </Pressable>
          <Pressable
            onPress={chooseFromLibrary}
            style={styles.libraryButton}
            accessibilityRole="button"
          >
            <Text style={styles.libraryButtonText}>Choose from library</Text>
          </Pressable>
>>>>>>> origin/swish
        </View>

        {showGrid ? (
          <View pointerEvents="none" style={styles.compositionGrid}>
            <View style={[styles.gridLine, styles.gridVerticalLeft]} />
            <View style={[styles.gridLine, styles.gridVerticalRight]} />
            <View style={[styles.gridLine, styles.gridHorizontalTop]} />
            <View style={[styles.gridLine, styles.gridHorizontalBottom]} />
          </View>
        ) : null}

        {countdown !== null ? (
          <View pointerEvents="none" style={styles.countdownOverlay}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownLabel}>GET READY</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roundControl: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 22,
    backgroundColor: 'rgba(20,20,19,0.48)',
  },
<<<<<<< HEAD
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '300',
    lineHeight: 32,
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roundControlActive: {
    backgroundColor: 'rgba(146,225,232,0.2)',
    borderColor: colors.accent,
  },
  gridIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
  },
  flashControl: {
    minWidth: 48,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 22,
    backgroundColor: 'rgba(20,20,19,0.48)',
  },
  flashIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  flashLabel: {
    color: '#FFFFFF',
    fontSize: 8,
=======
  topControlText: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cameraLabel: {
    ...typography.mono.micro,
    color: colors.accent,
>>>>>>> origin/swish
    fontWeight: '700',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  promptCard: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.glassStrong,
  },
  promptHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  promptDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  promptLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  prompt: {
<<<<<<< HEAD
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
=======
    maxWidth: 300,
    marginBottom: spacing.xl,
    ...typography.serif.body,
    color: colors.textPrimary,
    textAlign: 'center',
>>>>>>> origin/swish
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    gap: spacing.sm,
  },
  zoomOption: {
    minWidth: 44,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  zoomOptionActive: {
    backgroundColor: 'rgba(146,225,232,0.2)',
  },
  zoomText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  zoomTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timerLabel: {
    marginRight: spacing.xs,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerOption: {
    minWidth: 42,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 14,
  },
  timerOptionActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(146,225,232,0.12)',
  },
  timerText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '700',
  },
  timerTextActive: {
    color: '#FFFFFF',
  },
  captureRow: {
    width: '100%',
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  sideControl: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.64)',
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,19,0.58)',
  },
  latestPhoto: {
    width: '100%',
    height: '100%',
  },
  libraryIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flipIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
  },
  shutterOuter: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.16)',
=======
    borderWidth: 2,
    borderColor: colors.chrome,
    borderRadius: 38,
    backgroundColor: 'rgba(191, 195, 204, 0.05)',
>>>>>>> origin/swish
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterInner: {
<<<<<<< HEAD
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.accent,
  },
  modeLabel: {
    minHeight: 14,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  loadingLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 11,
  },
  compositionGrid: {
    ...StyleSheet.absoluteFill,
    top: 104,
    bottom: 280,
    marginHorizontal: spacing.xl,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  gridVerticalLeft: {
    top: 0,
    bottom: 0,
    left: '33.333%',
    width: 1,
  },
  gridVerticalRight: {
    top: 0,
    bottom: 0,
    right: '33.333%',
    width: 1,
  },
  gridHorizontalTop: {
    left: 0,
    right: 0,
    top: '33.333%',
    height: 1,
  },
  gridHorizontalBottom: {
    left: 0,
    right: 0,
    bottom: '33.333%',
    height: 1,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 96,
    fontWeight: '300',
    lineHeight: 108,
  },
  countdownLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  error: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(145,68,86,0.92)',
    color: '#FFFFFF',
    fontSize: 12,
=======
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.chrome,
    borderWidth: 2,
    borderColor: colors.chromeHighlight,
  },
  shutterGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: colors.accent,
    opacity: 0.3,
  },
  libraryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  libraryButtonText: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  error: {
    marginBottom: spacing.md,
    ...typography.caption,
    color: colors.error,
>>>>>>> origin/swish
    textAlign: 'center',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.background,
  },
  permissionMark: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  permissionMarkText: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  permissionEyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  permissionTitle: {
<<<<<<< HEAD
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    maxWidth: 290,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 22,
=======
    ...typography.serif.title2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.textMuted,
>>>>>>> origin/swish
    textAlign: 'center',
  },
  permissionButton: {
    minHeight: 52,
    minWidth: 190,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  permissionButtonText: {
<<<<<<< HEAD
    color: colors.onPrimary,
    fontSize: 15,
=======
    ...typography.callout,
    color: colors.textInverse,
>>>>>>> origin/swish
    fontWeight: '700',
  },
  permissionCancel: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  cancelText: {
<<<<<<< HEAD
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
  },
  });
}
=======
    padding: spacing.md,
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
});
>>>>>>> origin/swish
