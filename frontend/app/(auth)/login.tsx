import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
        if (error) throw error;
      } else {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) throw error;
      }
      router.replace('/(tabs)/home');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed. Try again.');
      setIsSubmitting(false);
    }
  };

  const continueLocally = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>M</Text>
            </View>
            <View style={styles.brandText}>
              <Text style={styles.brandName}>MEMORA</Text>
              <Text style={styles.brandTagline}>A place for the small things</Text>
            </View>
          </View>

          <Text style={styles.headline}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={styles.subheadline}>
            {mode === 'signup'
              ? 'Start building your private photo journal today.'
              : 'Sign in to access your memories.'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {hasSupabaseConfig ? (
              <>
                {mode === 'signup' && (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Display Name</Text>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Your name"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="words"
                      autoComplete="name"
                      returnKeyType="next"
                      style={styles.input}
                      accessibilityLabel="Display name"
                    />
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    style={styles.input}
                    accessibilityLabel="Email address"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Your password'}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={styles.input}
                    accessibilityLabel="Password"
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <Button
                  title={isSubmitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                  onPress={handleSubmit}
                  disabled={isSubmitting || !email.trim() || !password}
                  variant="accent"
                  fullWidth
                  size="lg"
                />

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                  </Text>
                  <Button
                    title={mode === 'signup' ? 'Sign in instead' : 'Create account'}
                    onPress={() => {
                      setMode(mode === 'signup' ? 'signin' : 'signup');
                      setErrorMessage(null);
                    }}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </>
            ) : (
              <View style={styles.localAccess}>
                <View style={styles.localIcon}>
                  <Text style={styles.localIconText}>🔒</Text>
                </View>
                <Text style={styles.localTitle}>Private local journal</Text>
                <Text style={styles.localMessage}>
                  Cloud accounts aren't configured. Your memories are stored privately on this
                  device and never leave it.
                </Text>
                <Button
                  title="Open my journal"
                  onPress={continueLocally}
                  variant="accent"
                  fullWidth
                  size="lg"
                />
              </View>
            )}
          </View>

          {/* Footer privacy note */}
          <Text style={styles.privacyNote}>
            Your memories are private. No ads, no tracking, no sharing without your consent.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.massive,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    ...typography.serif.title3,
    color: colors.chrome,
    fontWeight: '700',
  },
  brandText: {
    gap: 2,
  },
  brandName: {
    ...typography.sans.headline,
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  brandTagline: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  headline: {
    ...typography.serif.title2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subheadline: {
    ...typography.sans.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.sans.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    ...typography.sans.body,
    minHeight: 50,
  },
  errorBox: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.sm,
    borderWidth: borders.hairline,
    borderColor: colors.error,
    padding: spacing.md,
  },
  errorText: {
    ...typography.sans.footnote,
    color: colors.error,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  toggleLabel: {
    ...typography.sans.footnote,
    color: colors.textMuted,
  },
  localAccess: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  localIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localIconText: {
    fontSize: 28,
  },
  localTitle: {
    ...typography.serif.title3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  localMessage: {
    ...typography.sans.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  privacyNote: {
    ...typography.sans.caption2,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
