import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { signInWithEmail } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) throw error;
      router.replace('/(tabs)/today');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in.');
      setIsSubmitting(false);
    }
  };

  const continueLocally = () => router.replace('/(tabs)/today');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>M</Text></View>
            <Text style={styles.brandName}>MEMORA</Text>
          </View>
          <Text style={styles.kicker}>A place for the small things</Text>
          <Text style={styles.title}>Moments worth keeping.</Text>
          <Text style={styles.subtitle}>A private place for everyday moments, made to become memories.</Text>

          <Card style={styles.card}>
            {hasSupabaseConfig ? (
              <>
                <Text style={styles.formTitle}>Sign in</Text>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />

                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />

                {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
                <Button
                  title={isSubmitting ? 'Signing in…' : 'Sign in'}
                  onPress={handleLogin}
                  disabled={isSubmitting || !email.trim() || !password}
                />

                <Link href="/(auth)/forgot-password" asChild>
                  <Text style={styles.link}>Forgot password?</Text>
                </Link>
              </>
            ) : (
              <View style={styles.localAccess}>
                <Text style={styles.formTitle}>Your journal is ready</Text>
                <Text style={styles.localMessage}>Sign-in accounts aren’t connected yet. You can still keep photos privately on this device.</Text>
                <Button title="Continue without account" onPress={continueLocally} />
              </View>
            )}
          </Card>

          {hasSupabaseConfig ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to Memora?</Text>
              <Link href="/(auth)/register" asChild>
                <Text style={styles.link}>Create account</Text>
              </Link>
            </View>
          ) : (
            <Text style={styles.privacyNote}>Your photos stay on this device.</Text>
          )}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 19,
  },
  brandName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  card: {
    borderRadius: radius.xl,
    marginTop: spacing.md,
  },
  formTitle: {
    ...typography.subheading,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  localAccess: {
    gap: spacing.md,
  },
  localMessage: {
    ...typography.body,
    color: colors.muted,
  },
  fieldLabel: {
    color: colors.text,
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
  link: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  errorMessage: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.muted,
  },
  privacyNote: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
  },
  });
}
