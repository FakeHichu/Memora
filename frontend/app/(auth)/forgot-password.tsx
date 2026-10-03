import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { resetPasswordForEmail } from '@/lib/supabase/auth';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendResetLink = async () => {
    setIsSending(true);
    setMessage(null);

    const { error } = await resetPasswordForEmail(email.trim());
    setMessage(
      error ? error.message : 'If an account exists for that email, a reset link has been sent.',
    );
    setIsSending(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Reset access</Text>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>We'll send a reset link to the email on your account.</Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button
            title={isSending ? 'Sending...' : 'Send reset link'}
            onPress={sendResetLink}
            disabled={isSending}
            variant="accent"
            fullWidth
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remembered it?</Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Back to login</Text>
          </Link>
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  message: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
