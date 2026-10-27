import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon, type JamIconName } from '@/components/ui/Icons';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { borders, colors, radius, spacing, typography } from '@/constants/theme';

const features: { icon: JamIconName; title: string; detail: string }[] = [
  { icon: 'camera', title: 'Save a moment', detail: 'Photos, right from your day' },
  { icon: 'pencil', title: 'Tell its story', detail: 'Add the little details' },
  { icon: 'calendar', title: 'Look back', detail: 'Memories, in their own time' },
  { icon: 'search', title: 'Find it again', detail: 'Your moments, easy to find' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern opacity={0.022} />
      <View pointerEvents="none" style={styles.ambientBackdrop}>
        <View style={styles.ambientGlow} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Icon name="heart" size={17} color={colors.accentLight} />
          </View>
          <Text style={styles.brandName}>MEMORA</Text>
          <View style={styles.privatePill}>
            <View style={styles.privateDot} />
            <Text style={styles.privateLabel}>JUST FOR YOU</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR LIFE, IN LITTLE MOMENTS</Text>
          <Text style={styles.title}>Keep the moments{"\n"}that feel like you.</Text>
          <Text style={styles.subtitle}>
            A little home for your photos, stories, and all the things you never want to forget.
          </Text>

          <View style={styles.illustration}>
            <View style={styles.illustrationHalo} />
            <View style={[styles.floatCard, styles.floatCardBack]}>
              <View style={styles.floatCardIcon}>
                <Icon name="calendar" size={18} color={colors.accentLight} />
              </View>
              <View style={styles.floatLines}>
                <View style={styles.floatLineLong} />
                <View style={styles.floatLineShort} />
              </View>
            </View>
            <View style={[styles.floatCard, styles.floatCardSide]}>
              <Icon name="heart" size={19} color={colors.accentLight} />
              <Text style={styles.sideCardLabel}>KEEPSAKE</Text>
            </View>

            <View style={styles.memoryPreview}>
              <View style={styles.previewImage}>
                <View style={styles.previewSun} />
                <View style={styles.previewHillBack} />
                <View style={styles.previewHillFront} />
                <View style={styles.previewSparkle}>
                  <Icon name="star" size={14} color="#FFF0D9" />
                </View>
              </View>
              <View style={styles.previewFooter}>
                <View>
                  <Text style={styles.previewTitle}>A day worth keeping</Text>
                  <Text style={styles.previewDate}>A moment, just like that.</Text>
                </View>
                <View style={styles.previewHeart}>
                  <Icon name="heart" size={14} color={colors.accentLight} />
                </View>
              </View>
            </View>

            <View style={styles.savedBadge}>
              <View style={styles.savedBadgeIcon}>
                <Icon name="bookmark" size={13} color={colors.accentLight} />
              </View>
              <Text style={styles.savedBadgeText}>A little moment, saved</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureTitle}>Made for your memories</Text>
            <Text style={styles.featureCount}>01 — 04</Text>
          </View>
          <View style={styles.featureGrid}>
            {features.map((feature) => (
              <View key={feature.title} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Icon name={feature.icon} size={17} color={colors.accentLight} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureItemTitle}>{feature.title}</Text>
                  <Text style={styles.featureDetail}>{feature.detail}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.circleRow}>
            <View style={styles.circleIcon}>
              <Icon name="users" size={17} color={colors.chrome} />
            </View>
            <View style={styles.circleCopy}>
              <Text style={styles.featureItemTitle}>Share with your Circle</Text>
              <Text style={styles.featureDetail}>Keep your favorite people close</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get started"
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
          <Text style={styles.footerNote}>Your memories stay yours.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    width: 260,
    height: 260,
    borderRadius: radius.circle,
    top: 150,
    right: -180,
    backgroundColor: 'rgba(184, 79, 125, 0.09)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 110px 72px rgba(184, 79, 125, 0.12)' }
      : {}),
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
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 79, 125, 0.14)',
    borderWidth: borders.thin,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderWidth: borders.hairline,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  privateDot: {
    width: 6,
    height: 6,
    borderRadius: radius.circle,
    backgroundColor: '#83C99D',
  },
  privateLabel: {
    ...typography.sans.micro,
    color: colors.textSecondary,
    fontSize: 9,
  },
  hero: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    ...typography.mono.micro,
    color: colors.accentLight,
    letterSpacing: 1.15,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.sans.title,
    color: colors.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
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
    height: 218,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  illustrationHalo: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: radius.circle,
    backgroundColor: 'rgba(184, 79, 125, 0.08)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 55px 28px rgba(184, 79, 125, 0.09)' }
      : {}),
  },
  floatCard: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(31, 31, 42, 0.82)',
    borderWidth: borders.thin,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
        }
      : {}),
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
    backgroundColor: 'rgba(184, 79, 125, 0.14)',
  },
  floatLines: {
    gap: 4,
    marginTop: spacing.xs,
  },
  floatLineLong: {
    width: 48,
    height: 3,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  floatLineShort: {
    width: 31,
    height: 3,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
    backgroundColor: 'rgba(32, 30, 39, 0.92)',
    borderWidth: borders.thin,
    borderColor: 'rgba(255, 255, 255, 0.19)',
    transform: [{ rotate: '-2deg' }],
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 18px 42px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }
      : {}),
  },
  previewImage: {
    height: 112,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: '#5D526E',
  },
  previewSun: {
    position: 'absolute',
    width: 31,
    height: 31,
    borderRadius: radius.circle,
    top: 21,
    right: 35,
    backgroundColor: '#F4CDAA',
  },
  previewHillBack: {
    position: 'absolute',
    width: 176,
    height: 85,
    left: -22,
    bottom: -36,
    borderRadius: 80,
    transform: [{ rotate: '-14deg' }],
    backgroundColor: '#A36F8F',
  },
  previewHillFront: {
    position: 'absolute',
    width: 165,
    height: 74,
    right: -29,
    bottom: -42,
    borderRadius: 70,
    transform: [{ rotate: '15deg' }],
    backgroundColor: '#544B68',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
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
    backgroundColor: 'rgba(184, 79, 125, 0.12)',
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
    backgroundColor: 'rgba(26, 26, 34, 0.92)',
    borderWidth: borders.thin,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }
      : {}),
  },
  savedBadgeIcon: {
    width: 23,
    height: 23,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 79, 125, 0.16)',
  },
  savedBadgeText: {
    ...typography.sans.caption2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  featureCard: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(25, 25, 33, 0.76)',
    borderWidth: borders.thin,
    borderColor: 'rgba(255, 255, 255, 0.095)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.045)',
        }
      : {}),
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  featureTitle: {
    ...typography.sans.headline,
    color: colors.textPrimary,
    fontSize: 15,
  },
  featureCount: {
    ...typography.mono.micro,
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  featureItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  featureIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 79, 125, 0.11)',
    borderWidth: borders.hairline,
    borderColor: 'rgba(255, 255, 255, 0.065)',
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureItemTitle: {
    ...typography.sans.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  featureDetail: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    marginTop: 2,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
  },
  circleIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(191, 195, 204, 0.08)',
  },
  circleCopy: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
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
