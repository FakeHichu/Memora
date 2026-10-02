import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icons';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Welcome to Memora</Text>
        <Text style={styles.title}>Your personal memory journal</Text>
        <Text style={styles.subtitle}>
          Capture the moments you want to keep. Photos, stories, and memories — all in one beautiful
          place.
        </Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.cardTitle}>What you can do</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Icon name="camera" size={20} color={colors.accent} style={styles.listIcon} />
              <Text>Take photos or choose from your gallery</Text>
            </View>
            <View style={styles.listItem}>
              <Icon name="pencil" size={20} color={colors.accent} style={styles.listIcon} />
              <Text>Add titles and stories to each memory</Text>
            </View>
            <View style={styles.listItem}>
              <Icon name="calendar" size={20} color={colors.accent} style={styles.listIcon} />
              <Text>Browse memories chronologically</Text>
            </View>
            <View style={styles.listItem}>
              <Icon name="search" size={20} color={colors.accent} style={styles.listIcon} />
              <Text>Search your memories instantly</Text>
            </View>
            <View style={styles.listItem}>
              <Icon name="users" size={20} color={colors.accent} style={styles.listIcon} />
              <Text>Share memories with your Circle</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Get started"
          onPress={() => router.replace('/(tabs)/home')}
          size="lg"
          variant="accent"
        />

        <View style={styles.divider}>
          <Text style={styles.dividerText}>Or</Text>
        </View>

        <Button
          title="Create or join a Circle"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/create-class')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  kicker: {
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 1.1,
  },
  title: {
    ...typography.serif.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.sans.body,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: radius.xl,
  },
  cardTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...typography.sans.body,
    color: colors.textPrimary,
  },
  listIcon: {
    flexShrink: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  dividerText: {
    ...typography.sans.caption,
    color: colors.textMuted,
  },
});