import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
<<<<<<< HEAD
import { useAppTheme } from '@/providers/ThemeProvider';

export default function CreateClassScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('12-A');
  const [school, setSchool] = useState('Northfield Academy');
  const [year, setYear] = useState('2026');
=======
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useClass } from '@/hooks/useClass';

export default function CreateClassScreen() {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState(String(currentYear));
>>>>>>> origin/swish
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createClassLocally, refreshClasses } = useClass();

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter a class name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (supabase) {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session)
          throw new Error('Sign in before creating a cloud class.');

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
            academicYear: Number(year) || currentYear,
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? 'Could not create class.');
        await refreshClasses();
        router.replace('/(tabs)/circle');
        return;
      }

      // Offline / Local Mode creation
      await createClassLocally(name.trim(), school.trim(), Number(year) || currentYear);
      router.replace('/(tabs)/circle');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create class.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>CREATE CIRCLE</Text>
        <Text style={styles.title}>Start a private digital yearbook</Text>
        <Text style={styles.subtitle}>
          Create a shared space for your class, cohort, or friend group to post daily memories
          together.
        </Text>

<<<<<<< HEAD
        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Class name</Text>
          <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.muted} style={styles.input} />

          <Text style={styles.fieldLabel}>School</Text>
          <TextInput value={school} onChangeText={setSchool} placeholderTextColor={colors.muted} style={styles.input} />

          <Text style={styles.fieldLabel}>Academic year</Text>
          <TextInput value={year} onChangeText={setYear} placeholderTextColor={colors.muted} style={styles.input} />
=======
        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class or Group Name</Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. Class 12-A, Biology Dept, Senior Cohort"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>School / Organization (Optional)</Text>
          <TextInput
            value={school}
            onChangeText={setSchool}
            placeholder="e.g. Oakridge Academy"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Graduation or Academic Year</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="2026"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
>>>>>>> origin/swish

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <Button
            title={isSubmitting ? 'Creating class…' : 'Create Class Circle'}
            onPress={handleCreate}
            disabled={isSubmitting || !name.trim()}
            variant="accent"
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an invite code?</Text>
          <Button
            title="Join an existing class"
            variant="secondary"
            onPress={() => router.push('/(onboarding)/join-class')}
          />
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
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 1.1,
  },
  title: {
    ...typography.serif.title,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
  subtitle: {
    ...typography.sans.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
  },
  fieldLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  input: {
<<<<<<< HEAD
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
=======
    backgroundColor: colors.backgroundElevated,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
>>>>>>> origin/swish
  },
  errorMessage: {
    ...typography.sans.caption,
    color: colors.error,
    marginBottom: spacing.md,
  },
  footerRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
<<<<<<< HEAD
  });
}
=======
  footerText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
});
>>>>>>> origin/swish
