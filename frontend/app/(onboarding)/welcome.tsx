import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Icon, type JamIconName } from '@/components/ui/Icons';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { borders, radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

const features: { icon: JamIconName; title: string; detail: string }[] = [
  { icon: 'camera', title: 'Save a moment', detail: 'Photos, right from your day' },
  { icon: 'pencil', title: 'Tell its story', detail: 'Add the little details' },
  { icon: 'calendar', title: 'Look back', detail: 'Memories, in their own time' },
  { icon: 'search', title: 'Find it again', detail: 'Your moments, easy to find' },
];

export default function WelcomeScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern opacity={0.022} />
      <View pointerEvents="none" style={styles.ambientBackdrop}>
        <View style={styles.ambientGlow} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Image
              source={require('@/assets/brand/logo-cat.png')}
              style={styles.brandMarkImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.brandName}>MEMORA</Text>
          <View style={styles.privatePill}>
            <View style={styles.privateDot} />
            <Text style={styles.privateLabel}>YOUR CLASS. YOUR CIRCLE.</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR CLASS. YOUR PEOPLE. YOUR MEMORIES.</Text>
          <Text style={styles.title}>{"Capture memories\ntogether."}</Text>
          <Text style={styles.subtitle}>
            Share photos, relive moments, and stay connected with your class circle.
          </Text>

          <View style={styles.illustration}>
            <View style={styles.illustrationHalo} />
            <View style={[styles.floatCard, styles.floatCardBack]}>
              <View style={styles.floatCardIcon}>
                <Icon name="users" size={18} color={colors.accentLight} />
              </View>
              <View style={styles.floatLines}>
                <View style={styles.floatLineLong} />
                <View style={styles.floatLineShort} />
              </View>
            </View>
            <View style={[styles.floatCard, styles.floatCardSide]}>
              <Icon name="heart" size={19} color={colors.accentLight} />
              <Text style={styles.sideCardLabel}>CIRCLE</Text>
            </View>
            <View style={styles.memoryPreview}>
              <View style={styles.previewImage}>
                <View style={styles.previewSun} />
                <View style={styles.previewHillBack} />
                <View style={styles.previewHillFront} />
                <View style={styles.previewSparkle}>
                  <Icon name="star" size={14} color="#F9E2AF" />
                </View>
              </View>
              <View style={styles.previewFooter}>
                <View>
                  <Text style={styles.previewTitle}>Cyber Security 2026</Text>
                  <Text style={styles.previewDate}>24 members</Text>
                </View>
                <View style={styles.previewHeart}>
                  <Icon name="heart" size={14} color={colors.accentLight} />
                </View>
              </View>
            </View>
            <View style={styles.savedBadge}>
              <View style={styles.savedBadgeIcon}>
                <Icon name="users" size={13} color={colors.accentLight} />
              </View>
              <Text style={styles.savedBadgeText}>You're inside this Circle!</Text>
            </View>
          </View>
        </View>

        <View style={styles.onboardingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.actions}>
          <Button
            title="Next →"
            onPress={() => router.replace('/(tabs)/home')}
            size="lg"
            variant="accent"
            fullWidth
          />
          <View style={styles.secondaryAction}>
            <Text style={styles.secondaryHint}>Making memories together?</Text>
            <Button
              title="Create or join a Circle"
              variant="secondary"
              onPress={() => router.push('/(onboarding)/create-class')}
              fullWidth
            />
          </View>
          <Text style={styles.footerNote}>Skip</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    ambientBackdrop: {
      ...StyleSheet.absoluteFill,
      overflow: 'hidden',
    },
    ambientGlow: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: radius.circle,
      top: 100,
      right: -180,
      backgroundColor: colors.accentSoft,
    },
    content: {
      width: '100%',
      maxWidth: 540,
      alignSelf: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxxl,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    brandMark: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0E0D17' : colors.accent,
      overflow: 'hidden',
      borderWidth: borders.thin,
      borderColor: colors.accentSoft,
    },
    brandMarkImage: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
    },
    brandName: {
      ...typography.sans.caption,
      color: colors.textPrimary,
      fontWeight: '700',
      letterSpacing: 1.6,
    },
    privatePill: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.hairline,
      borderColor: colors.accent,
    },
    privateDot: {
      width: 6,
      height: 6,
      borderRadius: radius.circle,
      backgroundColor: colors.success,
    },
    privateLabel: {
      ...typography.sans.micro,
      color: colors.accent,
      fontSize: 8,
    },
    hero: {
      alignItems: 'flex-start',
    },
    eyebrow: {
      ...typography.mono.micro,
      color: colors.accent,
      letterSpacing: 1.15,
      marginBottom: spacing.sm,
      fontSize: 9,
    },
    title: {
      ...typography.sans.title,
      color: colors.textPrimary,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.8,
    },
    subtitle: {
      ...typography.sans.callout,
      color: colors.textSecondary,
      lineHeight: 23,
      marginTop: spacing.sm,
      maxWidth: 390,
    },
    illustration: {
      width: '100%',
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    illustrationHalo: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: radius.circle,
      backgroundColor: colors.accentSoft,
    },
    floatCard: {
      position: 'absolute',
      zIndex: 1,
      borderRadius: radius.lg,
      backgroundColor: isDark ? 'rgba(49, 50, 68, 0.90)' : 'rgba(255, 255, 255, 0.90)',
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
    },
    floatCardBack: {
      width: 94,
      height: 76,
      top: 24,
      left: '12%',
      padding: spacing.sm,
      transform: [{ rotate: '-9deg' }],
    },
    floatCardIcon: {
      width: 29,
      height: 29,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    floatLines: {
      gap: 4,
      marginTop: spacing.xs,
    },
    floatLineLong: {
      width: 48,
      height: 3,
      borderRadius: radius.round,
      backgroundColor: colors.borderSoft,
    },
    floatLineShort: {
      width: 31,
      height: 3,
      borderRadius: radius.round,
      backgroundColor: colors.borderSoft,
    },
    floatCardSide: {
      width: 72,
      height: 68,
      top: 40,
      right: '11%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      transform: [{ rotate: '9deg' }],
    },
    sideCardLabel: {
      ...typography.sans.micro,
      color: colors.textSecondary,
      fontSize: 8,
      letterSpacing: 0.8,
    },
    memoryPreview: {
      zIndex: 2,
      width: 194,
      padding: spacing.sm,
      borderRadius: radius.xl,
      backgroundColor: isDark ? 'rgba(49, 50, 68, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      transform: [{ rotate: '-2deg' }],
    },
    previewImage: {
      height: 112,
      overflow: 'hidden',
      borderRadius: radius.lg,
      backgroundColor: isDark ? '#45475A' : '#B4BEFE',
    },
    previewSun: {
      position: 'absolute',
      width: 31,
      height: 31,
      borderRadius: radius.circle,
      top: 21,
      right: 35,
      backgroundColor: isDark ? '#F9E2AF' : '#DF8E1D',
    },
    previewHillBack: {
      position: 'absolute',
      width: 176,
      height: 85,
      left: -22,
      bottom: -36,
      borderRadius: 80,
      transform: [{ rotate: '-14deg' }],
      backgroundColor: isDark ? '#585B70' : '#7287FD',
    },
    previewHillFront: {
      position: 'absolute',
      width: 165,
      height: 74,
      right: -29,
      bottom: -42,
      borderRadius: 70,
      transform: [{ rotate: '15deg' }],
      backgroundColor: isDark ? '#313244' : '#8FA1FE',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    previewSparkle: {
      position: 'absolute',
      top: 16,
      left: 18,
    },
    previewFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
      paddingTop: spacing.sm,
    },
    previewTitle: {
      ...typography.sans.caption,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    previewDate: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      marginTop: 2,
    },
    previewHeart: {
      width: 28,
      height: 28,
      borderRadius: radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    savedBadge: {
      position: 'absolute',
      zIndex: 3,
      bottom: 9,
      right: '4%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingLeft: spacing.xs,
      paddingRight: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
      backgroundColor: isDark ? 'rgba(49, 50, 68, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderWidth: borders.thin,
      borderColor: colors.accent,
    },
    savedBadgeIcon: {
      width: 23,
      height: 23,
      borderRadius: radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    savedBadgeText: {
      ...typography.sans.caption2,
      color: colors.accent,
      fontWeight: '700',
    },
    onboardingDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radius.circle,
      backgroundColor: colors.borderSoft,
    },
    dotActive: {
      backgroundColor: colors.accent,
      width: 24,
    },
    actions: {
      marginTop: spacing.md,
      gap: spacing.md,
    },
    secondaryAction: {
      gap: spacing.sm,
    },
    secondaryHint: {
      ...typography.sans.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
    footerNote: {
      ...typography.sans.caption2,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  });
}
