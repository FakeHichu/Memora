import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { signUpWithEmail } from '@/lib/supabase/auth';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data, error } = await signUpWithEmail(email.trim(), password, name.trim());
      if (error) throw error;

      if (data?.session) {
        router.replace('/(onboarding)/welcome');
      } else {
        setMessage('Check your email to confirm your account, then sign in.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Create your account</Text>
        <Text style={styles.title}>Join your class</Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button
            title={isSubmitting ? 'Creating account…' : 'Create account'}
            onPress={handleRegister}
            disabled={isSubmitting || !name.trim() || !email.trim() || password.length < 8}
            variant="accent"
            fullWidth
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already joined?</Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Log in</Text>
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
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
    ...typography.sans.body,
  },
  footerRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.sans.callout,
    color: colors.accent,
    fontWeight: '600',
  },
  message: {
    ...typography.sans.footnote,
    color: colors.error,
    marginBottom: spacing.md,
  },
});