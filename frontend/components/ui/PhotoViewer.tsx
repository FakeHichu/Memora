import React, { useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, borders, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';

type PhotoViewerProps = {
  source: { uri: string };
  onClose: () => void;
  title?: string;
  date?: string;
  caption?: string;
  authorName?: string;
  initialLikes?: number;
  initialComments?: number;
  style?: ViewStyle;
};

export function PhotoViewer({
  source,
  onClose,
  title,
  date,
  caption,
  authorName = 'Sarah',
  initialLikes = 127,
  initialComments = 14,
  style,
}: PhotoViewerProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);

  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    Animated.timing(fadeAnim.current, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${caption || title || 'Check out this memory'} — on Memora`,
      });
    } catch {}
  };

  const displayCaption = caption || title || 'Golden hour vibes ☀️';

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim.current }]}>
      <Pressable onPress={close} style={styles.backdrop} accessibilityLabel="Close photo viewer" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar matching Screen 11: <, 1/1, X */}
        <View style={styles.topBar}>
          <Pressable onPress={close} style={styles.iconBtn} hitSlop={12}>
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.counterText}>1 / 1</Text>
          <Pressable onPress={close} style={styles.iconBtn} hitSlop={12}>
            <Icon name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Center Image */}
        <View style={styles.imageContainer}>
          <Image source={source} style={styles.image} resizeMode="contain" />
        </View>

        {/* Bottom Metadata & Actions matching Screen 11 */}
        <View style={styles.bottomSheet}>
          <Text style={styles.captionText}>
            {displayCaption}{' '}
            <Text style={styles.authorText}>by {authorName}</Text>
          </Text>

          <View style={styles.actionsRow}>
            <Pressable onPress={handleLike} style={styles.actionItem} hitSlop={8}>
              <Icon
                name="heart"
                size={20}
                color={hasLiked ? colors.error : colors.textPrimary}
              />
              <Text style={styles.actionCount}>{likes}</Text>
            </Pressable>

            <View style={styles.actionItem}>
              <Icon name="picture" size={20} color={colors.textPrimary} />
              <Text style={styles.actionCount}>{initialComments}</Text>
            </View>

            <Pressable onPress={handleShare} style={styles.actionItem} hitSlop={8}>
              <Icon name="share" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: isDark ? 'rgba(17, 17, 27, 0.96)' : 'rgba(239, 241, 245, 0.97)',
      zIndex: 1000,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(49, 50, 68, 0.6)' : 'rgba(204, 208, 218, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: 1,
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    image: {
      width: '100%',
      height: '100%',
      maxHeight: 520,
      borderRadius: radius.lg,
    },
    bottomSheet: {
      paddingHorizontal: 24,
      paddingVertical: 18,
      backgroundColor: isDark ? 'rgba(24, 24, 37, 0.92)' : 'rgba(230, 233, 239, 0.92)',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    captionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    authorText: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
}
