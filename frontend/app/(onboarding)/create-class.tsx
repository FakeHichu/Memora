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

export default function CreateClassScreen() {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [showJoinCode, setShowJoinCode] = useState(false);

  const handleCreate = async () => {
    if (!supabase) {
      setErrorMessage('Configure Supabase in frontend/.env before creating a class.');
      return;
    }

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

      // Store the join code and navigate to home
      setJoinCode(result.class.join_code);
      setShowJoinCode(true);
      // Navigate to home - owner will see join code
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create class.');
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
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g. 12-A" />

          <Text style={styles.fieldLabel}>School</Text>
          <TextInput value={school} onChangeText={setSchool} style={styles.input} placeholder="e.g. Northfield Academy" />

          <Text style={styles.fieldLabel}>Academic year</Text>
          <TextInput value={year.toString()} onChangeText={(text) => setYear(Number(text))} style={styles.input} placeholder="2026" keyboardType="number-pad" />

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <Button
            title="Create class"
            onPress={handleCreate}
            variant="accent"
            fullWidth
          />
        </Card>

        {/* Join code display after successful creation */}
        {joinCode && (
          <View style={styles.joinCodeContainer}>
            <Text style={styles.joinCodeText}>Class created! Share this join code with your classmates:</Text>
            <View style={styles.joinCodeBox}>
              <Text style={styles.joinCodeValue}>{joinCode}</Text>
              <Pressable
                onPress={() => {
                  setShowJoinCode(!showJoinCode);
                }}
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </Pressable>
            </View>
            <Button
              title="Go to Home"
              variant="secondary"
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.goHomeButton}
            />
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={{ color: colors.textMuted, ...typography.body }}>Want to join instead?</Text>
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
  joinCodeContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  joinCodeText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  joinCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  joinCodeValue: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  copyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  goHomeButton: {
    marginTop: spacing.md,
    width: '100%',
  },
});