import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useClass } from '@/hooks/useClass';

export default function JoinClassScreen() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { joinClass } = useClass();

  const handleJoin = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter an invite code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await joinClass(code);
    setIsSubmitting(false);

    if (result.success) {
      router.replace('/(tabs)/circle');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>JOIN CIRCLE</Text>
        <Text style={styles.title}>Enter your invite code</Text>
        <Text style={styles.subtitle}>
          Memora groups are private. Enter the 8-character code shared by your class admin.
        </Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class join code</Text>
          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text);
              if (errorMessage) setErrorMessage(null);
            }}
            autoCapitalize="characters"
            style={styles.input}
            placeholder="e.g. 7K9A-PQ2T"
            placeholderTextColor={colors.textMuted}
          />

          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <Button
            title={isSubmitting ? 'Verifying code…' : 'Join class'}
            onPress={handleJoin}
            disabled={isSubmitting || !code.trim()}
            variant="accent"
          />
        </Card>

        <View style={styles.helperWrap}>
          <Text style={styles.helperTitle}>Private by design</Text>
          <Text style={styles.helperText}>
            Only members with this code can see photos and classmate posts. Nothing is ever indexed
            or public.
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Need to start a new class instead?</Text>
          <Button
            title="Create a class"
            variant="secondary"
            onPress={() => router.push('/(onboarding)/create-class')}
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
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    ...typography.mono.body,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  errorMessage: {
    ...typography.sans.caption,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  helperWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSubtle,
    borderWidth: borders.hairline,
    borderColor: 'rgba(122, 159, 216, 0.15)',
    padding: spacing.lg,
  },
  helperTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.sans.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
});