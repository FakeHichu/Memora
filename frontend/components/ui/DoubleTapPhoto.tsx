import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '@/providers/ThemeProvider';

interface DoubleTapPhotoProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  borderRadius?: number;
}

export function DoubleTapPhoto({
  uri,
  style,
  imageStyle,
  onSingleTap,
  onDoubleTap,
  resizeMode = 'cover',
  borderRadius = 16,
}: DoubleTapPhotoProps) {
  const { colors, mode } = useAppTheme();
  const lastTapRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const triggerHeartBurst = () => {
    scaleAnim.setValue(0.2);
    opacityAnim.setValue(0.95);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.25,
        friction: 4,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    if (onDoubleTap) {
      onDoubleTap();
    }
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      triggerHeartBurst();
    } else {
      // Possible single tap - wait for potential second tap
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (onSingleTap) {
          onSingleTap();
        }
        timerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
    lastTapRef.current = now;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { borderRadius }, style]}
      accessibilityRole="imagebutton"
      accessibilityLabel="Double tap to like memory"
    >
      <Image
        source={{ uri }}
        style={[styles.image, { borderRadius }, imageStyle]}
        resizeMode={resizeMode}
      />

      {/* Animated Lavender Heart Burst overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.heartOverlay,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={colors.accent || '#B4BEFE'}
            stroke={mode === 'dark' ? '#1E1E2E' : '#EFF1F5'}
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'drop-shadow(0 6px 14px rgba(180, 190, 254, 0.6))',
        } as any)
      : {}),
  },
});
