import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { resetPasswordForEmail } from '@/lib/supabase/auth';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const sendResetLink = async () => {
    setMessage(null);
    setSuccessMessage(null);

    if (!validateEmail(email)) {
      return;
    }

    setIsSending(true);

    try {
      const { error } = await resetPasswordForEmail(email.trim());
      
      if (error) {
        setMessage(error.message);
        setIsSending(false);
        return;
      }

      setSuccessMessage('Password reset instructions have been sent to your email.');
      setEmailSent(true);
      setEmail('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send reset email.');
    } finally {
      setIsSending(false);
    }
  };

  const goBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>M</Text>
          </View>
          <Text style={styles.brandName}>MEMORA</Text>
        </View>

        <Text style={styles.kicker}>Reset access</Text>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter your email and we'll send you instructions to reset your password.
        </Text>

        <Card style={styles.card} variant="editorial">
          {!emailSent ? (
            <>
              <View>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(null);
                    if (message) setMessage(null);
                  }}
                  onBlur={() => email && validateEmail(email)}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="send"
                  onSubmitEditing={sendResetLink}
                  editable={!isSending}
                  style={[styles.input, emailError && styles.inputError]}
                />
                {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
              </View>

              {message ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorMessage}>{message}</Text>
                </View>
              ) : null}

              <Button
                title={isSending ? 'Sending...' : 'Send reset link'}
                onPress={sendResetLink}
                disabled={isSending || !email.trim()}
                variant="accent"
                fullWidth
              />
            </>
          ) : (
            <View style={styles.successView}>
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successMessage}>{successMessage}</Text>
              </View>
              <Text style={styles.successNote}>
                Check your inbox and follow the instructions to reset your password.
              </Text>
              <Button
                title="Back to sign in"
                onPress={goBackToLogin}
                variant="accent"
                fullWidth
              />
            </View>
          )}
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remembered your password?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable disabled={isSending}>
              <Text style={[styles.link, isSending && styles.linkDisabled]}>Sign in</Text>
            </Pressable>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chromeDark,
    borderWidth: 1,
    borderColor: colors.chrome,
  },
  brandMarkText: {
    ...typography.title2,
    color: colors.textOnChrome,
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
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    ...typography.body,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  fieldError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground || 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorMessage: {
    ...typography.footnote,
    color: colors.error,
    lineHeight: 20,
  },
  successView: {
    gap: spacing.md,
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: radius.sm,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  successIcon: {
    fontSize: 32,
    color: '#16a34a',
    fontWeight: '700',
  },
  successMessage: {
    ...typography.body,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '600',
  },
  successNote: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  linkDisabled: {
    opacity: 0.5,
  },
});
