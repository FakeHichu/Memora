import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Clipboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

<<<<<<< HEAD
import { spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function ClassDetailScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
=======
import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useClass } from '@/hooks/useClass';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { classes, activeClass } = useClass();
  const [copiedCode, setCopiedCode] = useState(false);

  const targetClass = useMemo(() => {
    return classes.find((c) => c.id === classId) || activeClass;
  }, [classes, classId, activeClass]);

  const handleCopyCode = () => {
    if (targetClass?.join_code) {
      Clipboard.setString(targetClass.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      Alert.alert('Code Copied', `Invite code "${targetClass.join_code}" copied to clipboard.`);
    }
  };

  if (!targetClass) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <View style={styles.notFoundContainer}>
          <Text style={styles.title}>Class Not Found</Text>
          <Text style={styles.message}>This class or cohort could not be loaded.</Text>
          <Button
            title="Go to Circles"
            variant="accent"
            onPress={() => router.replace('/(tabs)/circle')}
          />
        </View>
      </SafeAreaView>
    );
  }

>>>>>>> origin/swish
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.navRow}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            variant="overlay"
            size="md"
            accessibilityLabel="Go back"
          />
          <Text style={styles.navTitle}>Class Details</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{targetClass.name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.className}>{targetClass.name}</Text>
          <Text style={styles.schoolName}>{targetClass.school_name || 'Class Circle'}</Text>
          <Text style={styles.yearText}>Academic Year {targetClass.academic_year}</Text>

          {/* Invite Code Box */}
          <Pressable
            onPress={handleCopyCode}
            style={styles.inviteBox}
            accessibilityRole="button"
            accessibilityLabel="Copy invite code"
          >
            <Text style={styles.inviteLabel}>CLASS INVITE CODE</Text>
            <Text style={styles.inviteCode}>{targetClass.join_code}</Text>
            <Text style={styles.inviteHint}>
              {copiedCode ? '✓ Copied to clipboard' : 'Tap to copy and invite classmates'}
            </Text>
          </Pressable>
        </View>

        {/* Privacy Note */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Privacy & Rules</Text>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>
              Only members with this code can view and share memories.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>
              Every member takes exactly 1 photo each calendar day.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>
              Daily photos compile into your shared Digital Yearbook.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: borders.hairline,
    borderColor: colors.borderChrome,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.xxl,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.serif.title,
    color: colors.accent,
    fontWeight: '700',
  },
  className: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  schoolName: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: 2,
  },
  yearText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  inviteBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderChrome,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  inviteLabel: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  inviteCode: {
    ...typography.mono.body,
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 3,
    marginVertical: 4,
  },
  inviteHint: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  infoSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: borders.hairline,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  ruleDot: {
    color: colors.accent,
    fontWeight: '700',
  },
  ruleText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  });
}
