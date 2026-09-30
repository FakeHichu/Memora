import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { signUpWithEmail } from '@/lib/supabase/auth';

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Create your account</Text>
        <Text style={styles.title}>Join your class</Text>

        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
            style={styles.input}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button title={isSubmitting ? 'Creating account…' : 'Create account'} onPress={handleRegister} disabled={isSubmitting} />
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
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
    color: colors.error,
    marginBottom: spacing.md,
  },
});
