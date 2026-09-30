import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Step 1</Text>
        <Text style={styles.title}>Start your class memory thread</Text>
        <Text style={styles.subtitle}>
          Build a private shared yearbook where your class posts one daily photo and remembers the
          moments that matter.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>What happens next?</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Create a class or join with a private code.</Text>
            <Text style={styles.listItem}>• See today’s prompt and share one photo.</Text>
            <Text style={styles.listItem}>• Keep the class timeline and annual memory book alive.</Text>
          </View>
        </Card>

        <Button title="Create or join a class" onPress={() => router.push('/(onboarding)/create-class')} />
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
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  card: {
    borderRadius: radius.xl,
  },
  cardTitle: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    ...typography.body,
    color: colors.text,
  },
});
