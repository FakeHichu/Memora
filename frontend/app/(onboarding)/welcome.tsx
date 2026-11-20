import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { HeartMark } from '@/components/ui/HeartMark';
import { supabase } from '@/lib/supabase/client';

const SLIDES = [
  {
    key: 'memories',
    title: 'Capture Memories\nTogether',
    subtitle: 'Share photos, relive moments,\nand stay connected with your circle.',
  },
  {
    key: 'circle',
    title: 'Your Circle,\nYour World',
    subtitle: 'Be part of your class circle\nand see what everyone shares.',
  },
];

export default function WelcomeScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          router.replace('/(tabs)/home');
          return;
        }
      }
      router.replace('/(auth)/register');
    }
  };

  const handleSkip = async () => {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace('/(tabs)/home');
        return;
      }
    }
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <HeartMark size={32} />
        {currentSlide === 0 ? (
          <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setCurrentSlide(0)}
            hitSlop={12}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Back</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Illustration Container */}
        <View style={styles.illustrationWrapper}>
          {currentSlide === 0 ? (
            <PhotosIllustration colors={colors} mode={mode} />
          ) : (
            <CircleIllustration colors={colors} mode={mode} />
          )}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* Indicators */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, currentSlide === 0 && styles.dotActive]} />
          <View style={[styles.dot, currentSlide === 1 && styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleNext}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {currentSlide === 0 ? 'Next →' : 'Get Started'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.secondaryHighlight}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PhotosIllustration({ colors, mode }: { colors: ThemeColors; mode: string }) {
  const isDark = mode === 'dark';
  return (
    <View style={illustStyles.container}>
      <Svg width="260" height="230" viewBox="0 0 260 230" fill="none">
        <Defs>
          <LinearGradient id="photoGrad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={isDark ? '#45475A' : '#CCD0DA'} />
            <Stop offset="100%" stopColor={isDark ? '#313244' : '#E6E9EF'} />
          </LinearGradient>
          <LinearGradient id="photoGrad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={isDark ? '#585B70' : '#ACB0BE'} />
            <Stop offset="100%" stopColor={isDark ? '#313244' : '#CCD0DA'} />
          </LinearGradient>
          <LinearGradient id="accentGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={colors.mauve || '#CBA6F7'} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Soft background glow */}
        <Circle cx="130" cy="115" r="90" fill="url(#accentGlow)" />

        {/* Back Photo Card (tilted left) */}
        <Rect
          x="30"
          y="35"
          width="110"
          height="135"
          rx="14"
          transform="rotate(-12 85 102)"
          fill={colors.card}
          stroke={colors.border}
          strokeWidth="2"
        />
        <Rect
          x="40"
          y="45"
          width="90"
          height="85"
          rx="8"
          transform="rotate(-12 85 87)"
          fill="url(#photoGrad1)"
        />

        {/* Front Photo Card (tilted right) */}
        <Rect
          x="115"
          y="45"
          width="115"
          height="145"
          rx="14"
          transform="rotate(8 172 117)"
          fill={colors.card}
          stroke={colors.border}
          strokeWidth="2"
        />
        <Rect
          x="125"
          y="55"
          width="95"
          height="95"
          rx="8"
          transform="rotate(8 172 102)"
          fill="url(#photoGrad2)"
        />

        {/* Photo graphic highlights */}
        <Circle cx="150" cy="80" r="12" fill={colors.yellow || '#F9E2AF'} opacity={0.8} />
        <Path
          d="M130 135 Q 160 100 185 125 T 215 130"
          stroke={colors.accent}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Floating Heart Badge */}
        <Circle cx="205" cy="40" r="16" fill={colors.accent} />
        <Path
          d="M205 47 C200 42 195 36 195 32 C195 28 198 26 201 26 C203 26 204 27 205 29 C206 27 207 26 209 26 C212 26 215 28 215 32 C215 36 210 42 205 47 Z"
          fill={colors.crust}
        />
      </Svg>
    </View>
  );
}

function CircleIllustration({ colors, mode }: { colors: ThemeColors; mode: string }) {
  const isDark = mode === 'dark';
  return (
    <View style={illustStyles.container}>
      <Svg width="260" height="230" viewBox="0 0 260 230" fill="none">
        <Defs>
          <LinearGradient id="circGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={colors.blue || '#89B4FA'} stopOpacity={0.08} />
          </LinearGradient>
        </Defs>

        {/* Soft background glow */}
        <Circle cx="130" cy="115" r="95" fill="url(#circGlow)" />

        {/* Class circle banner / card */}
        <Rect
          x="35"
          y="50"
          width="190"
          height="120"
          rx="20"
          fill={colors.card}
          stroke={colors.border}
          strokeWidth="2"
        />

        {/* Class Avatar 1 */}
        <Circle cx="80" cy="95" r="22" fill={colors.accent} />
        <Circle cx="80" cy="88" r="9" fill={colors.crust} opacity={0.6} />
        <Path d="M66 110 C66 102 73 98 80 98 C87 98 94 102 94 110" fill={colors.crust} opacity={0.6} />

        {/* Class Avatar 2 (Center) */}
        <Circle cx="130" cy="90" r="26" fill={colors.mauve || '#CBA6F7'} />
        <Circle cx="130" cy="82" r="11" fill={colors.crust} opacity={0.6} />
        <Path d="M113 112 C113 103 121 98 130 98 C139 98 147 103 147 112" fill={colors.crust} opacity={0.6} />

        {/* Class Avatar 3 */}
        <Circle cx="180" cy="95" r="22" fill={colors.teal || '#94E2D5'} />
        <Circle cx="180" cy="88" r="9" fill={colors.crust} opacity={0.6} />
        <Path d="M166 110 C166 102 173 98 180 98 C187 98 194 102 194 110" fill={colors.crust} opacity={0.6} />

        {/* Pill badge: Cyber Security 2026 */}
        <Rect
          x="65"
          y="138"
          width="130"
          height="22"
          rx="11"
          fill={isDark ? '#45475A' : '#CCD0DA'}
        />
        <Circle cx="76" cy="149" r="4" fill={colors.green} />
      </Svg>
    </View>
  );
}

const illustStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 240,
  },
});

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
    },
    skipBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    skipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 32,
      justifyContent: 'space-between',
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    textContainer: {
      alignItems: 'center',
      marginVertical: 24,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '400',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 12,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 28,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? colors.surface1 : colors.surface1,
      opacity: 0.5,
    },
    dotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      opacity: 1,
    },
    actionContainer: {
      gap: 12,
      width: '100%',
    },
    primaryButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
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
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.crust,
    },
    secondaryButton: {
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    secondaryHighlight: {
      color: colors.blue || '#89B4FA',
      fontWeight: '700',
    },
  });
}
