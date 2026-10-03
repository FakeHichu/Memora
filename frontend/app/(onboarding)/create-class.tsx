import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function CreateClassScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
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
      router.replace('/(tabs)/today');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create class.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Create class</Text>
        <Text style={styles.title}>Build a private digital yearbook</Text>

        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Class name</Text>
          <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.muted} style={styles.input} />

          <Text style={styles.fieldLabel}>School</Text>
          <TextInput value={school} onChangeText={setSchool} placeholderTextColor={colors.muted} style={styles.input} />

          <Text style={styles.fieldLabel}>Academic year</Text>
          <TextInput value={year} onChangeText={setYear} placeholderTextColor={colors.muted} style={styles.input} />

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <Button title={isSubmitting ? 'Creating class…' : 'Create class'} onPress={handleCreate} disabled={isSubmitting} />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Want to join instead?</Text>
          <Button title="Join class" variant="secondary" onPress={() => router.push('/(onboarding)/join-class')} />
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
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  footerRow: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  errorMessage: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  footerText: {
    color: colors.muted,
    textAlign: 'center',
  },
  });
}
