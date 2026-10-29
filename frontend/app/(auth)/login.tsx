import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { signInWithEmail } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signInWithEmail(email.trim(), password);
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please verify your email before signing in.');
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data?.session) {
        // Successfully logged in
        router.replace('/(onboarding)/welcome');
      } else {
        setErrorMessage('Unable to sign in. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const continueLocally = () => router.replace('/(onboarding)/welcome');

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>M</Text>
            </View>
            <Text style={styles.brandName}>MEMORA</Text>
          </View>
          <Text style={styles.kicker}>A place for the small things</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to access your memories and moments.
          </Text>

          <Card style={styles.card} variant="editorial">
            {hasSupabaseConfig ? (
              <>
                <Text style={styles.formTitle}>Sign in to your account</Text>
                
                <View>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError(null);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={() => email && validateEmail(email)}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    editable={!isSubmitting}
                    style={[styles.input, emailError && styles.inputError]}
                  />
                  {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
                </View>

                <View>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onBlur={() => password && validatePassword(password)}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      editable={!isSubmitting}
                      style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                    />
                    <Pressable 
                      onPress={() => setShowPassword(!showPassword)} 
                      style={styles.showPasswordButton}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                <Button
                  title={isSubmitting ? 'Signing in...' : 'Sign in'}
                  onPress={handleLogin}
                  disabled={isSubmitting || !email.trim() || !password}
                  variant="accent"
                  fullWidth
                />

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable disabled={isSubmitting}>
                    <Text style={[styles.link, isSubmitting && styles.linkDisabled]}>
                      Forgot password?
                    </Text>
                  </Pressable>
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
                <Pressable disabled={isSubmitting}>
                  <Text style={[styles.link, isSubmitting && styles.linkDisabled]}>
                    Create account
                  </Text>
                </Pressable>
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
  },
  subtitle: {
    ...typography.body,
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
    ...typography.body,
    color: colors.textSecondary,
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
  passwordContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 70,
  },
  showPasswordButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  showPasswordText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
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
  link: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  errorMessage: {
    ...typography.footnote,
    color: colors.error,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  privacyNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
