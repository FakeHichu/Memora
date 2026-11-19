import React from 'react';
import { Pressable, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Icon } from '../ui/Icons';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';

interface NewPostsBannerProps {
  visible: boolean;
  onPress: () => void;
  count?: number;
}

export function NewPostsBanner({ visible, onPress, count = 1 }: NewPostsBannerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Pressable
        onPress={onPress}
        style={styles.banner}
        accessibilityRole="button"
        accessibilityLabel={`${count} new ${count === 1 ? 'photo' : 'photos'} available. Tap to load.`}
      >
        <Icon name="chevron-right" size={16} color="#FFFFFF" />
        <Text style={styles.text}>
          {count} new {count === 1 ? 'photo' : 'photos'} from classmates
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.lg,
      right: spacing.lg,
      zIndex: 100,
      alignItems: 'center',
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.accent,
      borderRadius: radius.round,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }),
    },
    text: {
      ...typography.sans.bodyStrong,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
