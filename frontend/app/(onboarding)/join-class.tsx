import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function JoinClassScreen() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [className, setClassName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState<string>('member');

  const handleJoin = async () => {
    if (!supabase) {
      setErrorMessage('Configure Supabase in frontend/.env before joining a class.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error('Sign in before joining a class.');

      const cleanCode = code.trim().toUpperCase();

      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/classes/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinCode: cleanCode }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Could not join class.');

      // Show class details
      setClassName(result.class.name);
      setSchoolName(result.class.school_name);
      setAcademicYear(result.class.academic_year);
      setMemberRole(result.member.role);

      // Navigate to home - user is now a member of the class
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not join class.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Join class</Text>
        <Text style={styles.title}>Enter your class code</Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class join code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            style={styles.input}
            placeholder="ABCD-1234"
            returnKeyType="done"
          />

          <Button title="Join class" onPress={handleJoin} variant="accent" fullWidth />
        </Card>

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {className && (
          <View style={styles.classDetails}>
            <Text style={styles.classDetailLabel}>You've joined</Text>
            <Text style={styles.classDetailValue}>{className}</Text>
            {schoolName && <Text style={styles.classDetailValue}>{schoolName}</Text>}
            {academicYear && (
              <Text style={styles.classDetailValue}>
                Academic year {academicYear}
              </Text>
            )}
            <Text style={styles.classDetailLabel}>Role: {memberRole}</Text>
          </View>
        )}

        <View style={styles.helperWrap}>
          <Text style={styles.helperTitle}>Private by design</Text>
          <Text style={styles.helperText}>
            The backend verifies the join code and checks class membership before granting access.
          </Text>
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
    ...typography.mono.body,
  },
  errorMessage: {
    ...typography.footnote,
    color: colors.error,
    marginBottom: spacing.md,
  },
  classDetails: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  classDetailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  classDetailValue: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  helperWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSubtle,
    borderWidth: 0.5,
    borderColor: 'rgba(184, 79, 125, 0.2)',
    padding: spacing.lg,
  },
  helperTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});