import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { signUpWithEmail } from '@/lib/supabase/auth';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return false;
    }
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

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
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleRegister = async () => {
    setMessage(null);
    setSuccessMessage(null);

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signUpWithEmail(email.trim(), password, name.trim());
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          setMessage('This email is already registered. Please sign in instead.');
        } else {
          setMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data?.session) {
        // User was logged in immediately (email confirmation disabled)
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          router.replace('/(onboarding)/welcome');
        }, 1000);
      } else {
        // User needs to confirm email
        setSuccessMessage('Account created! Please check your email to verify your account, then sign in.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
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
        
        <Text style={styles.kicker}>Join the community</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Start preserving your moments and memories today.
        </Text>

        <Card style={styles.card} variant="editorial">
          <View>
            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
                if (message) setMessage(null);
              }}
              onBlur={() => name && validateName(name)}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoComplete="name"
              returnKeyType="next"
              editable={!isSubmitting}
              style={[styles.input, nameError && styles.inputError]}
            />
            {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
          </View>

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
                  if (message) setMessage(null);
                  if (confirmPassword && confirmPasswordError) {
                    validateConfirmPassword(confirmPassword);
                  }
                }}
                onBlur={() => password && validatePassword(password)}
                secureTextEntry={!showPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textMuted}
                autoComplete="password-new"
                returnKeyType="next"
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
            {!passwordError && password && (
              <Text style={styles.fieldHint}>
                Must include uppercase, lowercase, and number
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Confirm password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                  if (message) setMessage(null);
                }}
                onBlur={() => confirmPassword && validateConfirmPassword(confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textMuted}
                autoComplete="password-new"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!isSubmitting}
                style={[styles.input, styles.passwordInput, confirmPasswordError && styles.inputError]}
              />
              <Pressable 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={styles.showPasswordButton}
                disabled={isSubmitting}
              >
                <Text style={styles.showPasswordText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {confirmPasswordError ? <Text style={styles.fieldError}>{confirmPasswordError}</Text> : null}
          </View>

          {message ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{message}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successMessage}>{successMessage}</Text>
            </View>
          ) : null}

          <Button
            title={isSubmitting ? 'Creating account…' : 'Create account'}
            onPress={handleRegister}
            disabled={isSubmitting || !name.trim() || !email.trim() || !password || !confirmPassword}
            variant="accent"
            fullWidth
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable disabled={isSubmitting}>
              <Text style={[styles.link, isSubmitting && styles.linkDisabled]}>Sign in</Text>
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
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    marginTop: spacing.md,
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
  fieldHint: {
    ...typography.caption,
    color: colors.textMuted,
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
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.footnote,
    color: '#16a34a',
    lineHeight: 20,
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
