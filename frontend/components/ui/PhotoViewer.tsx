import React from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography, animation, borders } from '@/constants/theme';

import { Icon } from '@/components/ui/Icons';

type PhotoViewerProps = {
  source: { uri: string };
  onClose: () => void;
  title?: string;
  date?: string;
  caption?: string;
  style?: ViewStyle;
};

/* eslint-disable react-hooks/refs */
export function PhotoViewer({ source, onClose, title, date, caption, style }: PhotoViewerProps) {
  const fadeAnim = React.useRef(new Animated.Value(0));
  const scaleAnim = React.useRef(new Animated.Value(0.95));
  const slideAnim = React.useRef(new Animated.Value(20));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim.current, {
        toValue: 1,
        duration: animation.fast,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim.current, {
        toValue: 1,
        tension: animation.spring.stiffness,
        friction: animation.spring.damping,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim.current, {
        toValue: 0,
        tension: animation.spring.stiffness,
        friction: animation.spring.damping,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim.current, {
        toValue: 0,
        duration: animation.fast,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim.current, {
        toValue: 0.95,
        duration: animation.fast,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim.current }]}>
      <Pressable onPress={close} style={styles.backdrop} accessibilityLabel="Close photo viewer" />

      <Animated.View
        style={[
          {
            transform: [
              { scale: scaleAnim.current },
              { translateY: slideAnim.current },
            ],
          },
          styles.container,
          style,
        ]}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <Pressable onPress={close} style={styles.closeButton} accessibilityLabel="Close">
              <Icon name="close" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </SafeAreaView>

        <Image source={source} style={styles.image} resizeMode="contain" />

        {(title || date || caption) && (
          <View style={styles.bottomSheet}>
            {title && <Text style={styles.title}>{title}</Text>}
            {date && <Text style={styles.date}>{date}</Text>}
            {caption && <Text style={styles.caption}>{caption}</Text>}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    width: '100%',
    height: '100%',
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    backgroundColor: 'rgba(8, 8, 12, 0.7)',
    borderWidth: borders.hairline,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginRight: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(8, 8, 12, 0.92)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: borders.hairline,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.mono.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.serifItalic.body,
    color: colors.textSecondary,
  },
});