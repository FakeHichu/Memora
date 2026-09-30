import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { resetPasswordForEmail } from '@/lib/supabase/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendResetLink = async () => {
    setIsSending(true);
    setMessage(null);

    const { error } = await resetPasswordForEmail(email.trim());
    setMessage(error ? error.message : 'If an account exists for that email, a reset link has been sent.');
    setIsSending(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Reset access</Text>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>We’ll send a reset link to the email on your account.</Text>

        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button title={isSending ? 'Sending…' : 'Send reset link'} onPress={sendResetLink} disabled={isSending} />
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginVertical: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.lg,
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
    backgroundColor: '#F9F8F7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
  },
  footerRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
  message: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
});
