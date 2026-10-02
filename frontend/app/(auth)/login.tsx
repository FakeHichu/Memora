import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { signInWithEmail } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function LoginScreen() {
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
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in.');
      setIsSubmitting(false);
    }
  };

  const continueLocally = () => router.replace('/(tabs)/home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>M</Text>
            </View>
            <Text style={styles.brandName}>MEMORA</Text>
          </View>
          <Text style={styles.kicker}>A place for the small things</Text>
          <Text style={styles.title}>Moments worth keeping.</Text>
          <Text style={styles.subtitle}>
            A private photo journal for the moments you want to remember.
          </Text>

          <Card style={styles.card} variant="editorial">
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
                  style={styles.input}
                />

                {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
                <Button
                  title={isSubmitting ? 'Signing in...' : 'Sign in'}
                  onPress={handleLogin}
                  disabled={isSubmitting || !email.trim() || !password}
                  variant="accent"
                  fullWidth
                />

                <Link href="/(auth)/forgot-password" asChild>
                  <Text style={styles.link}>Forgot password?</Text>
                </Link>
              </>
            ) : (
              <View style={styles.localAccess}>
                <Text style={styles.formTitle}>Your journal is ready</Text>
                <Text style={styles.localMessage}>
                  Sign-in accounts aren't connected yet. You can still keep photos privately on this
                  device.
                </Text>
                <Button
                  title="Continue without account"
                  onPress={continueLocally}
                  variant="accent"
                  fullWidth
                />
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

const styles = StyleSheet.create({
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
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
  },
  brandMarkText: {
    ...typography.serif.title2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  brandName: {
    ...typography.mono.micro,
    color: colors.chrome,
    fontWeight: '700',
  },
  kicker: {
    ...typography.mono.micro,
    color: colors.accent,
    letterSpacing: 1.1,
  },
  title: {
    ...typography.serif.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.sans.body,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: radius.xl,
    marginTop: spacing.md,
  },
  formTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  localAccess: {
    gap: spacing.md,
  },
  localMessage: {
    ...typography.sans.body,
    color: colors.textSecondary,
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
  link: {
    ...typography.sans.callout,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  errorMessage: {
    ...typography.sans.footnote,
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
    ...typography.sans.body,
    color: colors.textMuted,
  },
  privacyNote: {
    ...typography.sans.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});