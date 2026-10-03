import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function CreateClassScreen() {
  const [name, setName] = useState('12-A');
  const [school, setSchool] = useState('Northfield Academy');
  const [year, setYear] = useState('2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!supabase) {
      setErrorMessage('Configure Supabase in frontend/.env before creating a class.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error('Sign in before creating a class.');

      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/classes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: school.trim() || undefined,
          academicYear: Number(year),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Could not create class.');
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create class.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Create class</Text>
        <Text style={styles.title}>Build a private digital yearbook</Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Text style={styles.fieldLabel}>School</Text>
          <TextInput value={school} onChangeText={setSchool} style={styles.input} />

          <Text style={styles.fieldLabel}>Academic year</Text>
          <TextInput value={year} onChangeText={setYear} style={styles.input} />

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <Button
            title={isSubmitting ? 'Creating class…' : 'Create class'}
            onPress={handleCreate}
            disabled={isSubmitting}
            variant="accent"
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Want to join instead?</Text>
          <Button
            title="Join class"
            variant="secondary"
            onPress={() => router.push('/(onboarding)/join-class')}
          />
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
  content: {
    padding: spacing.xl,
  },
  kicker: {
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 1.1,
  },
  title: {
    ...typography.serif.title,
    color: colors.textPrimary,
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderChrome,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  footerRow: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  errorMessage: {
    ...typography.footnote,
    color: colors.error,
    marginBottom: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
