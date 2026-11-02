import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Icon } from '@/components/ui/Icons';
import type { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function LoginScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const { rememberMe, setRememberMe, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
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

    if (!isEmailValid || !isPasswordValid) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await signInWithEmail(email.trim(), password);

      if (error) {
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
        router.replace('/(onboarding)/welcome');
      } else {
        setErrorMessage('Unable to sign in. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const continueLocally = () => router.replace('/(onboarding)/welcome');
  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />

      {/* Top right theme toggle */}
      <View style={styles.topBar}>
        <Pressable
          onPress={toggleTheme}
          style={styles.themeToggle}
          accessibilityLabel={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Text style={styles.themeToggleText}>
            {mode === 'dark' ? '☀️ Light' : '🌙 Midnight'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Brand Mark Pill */}
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Icon name="camera" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandName}>MEMORA</Text>
              <Text style={styles.brandTagline}>Memory Capsule</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to access your memories and moments.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {hasSupabaseConfig ? (
              <>
                {/* Email field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Email address</Text>
                  <View style={[styles.inputTrack, emailError && styles.inputError]}>
                    <Icon name="envelope" size={18} color={colors.textSecondary} />
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
                      style={styles.input}
                    />
                  </View>
                  {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
                </View>

                {/* Password field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={[styles.inputTrack, passwordError && styles.inputError]}>
                    <Icon name="padlock" size={18} color={colors.textSecondary} />
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onBlur={() => password && validatePassword(password)}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      editable={!isSubmitting}
                      style={styles.input}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.showPasswordButton}
                      disabled={isSubmitting}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                </View>

                {/* Remember Me toggle */}
                <View style={styles.rememberMeContainer}>
                  <Pressable
                    onPress={() => setRememberMe(!rememberMe)}
                    style={[
                      styles.rememberMeBox,
                      rememberMe && styles.rememberMeBoxChecked,
                    ]}
                    accessibilityLabel={rememberMe ? 'Disable Remember Me' : 'Enable Remember Me'}
                    accessibilityState={{ checked: rememberMe }}
                  >
                    <Text style={styles.rememberMeIconText}>
                      {rememberMe ? '✓' : ''}
                    </Text>
                  </Pressable>
                  <Text style={styles.rememberMeText}>
                    {rememberMe ? 'Remember Me' : "Don't remember"}
                  </Text>
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Primary Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isSubmitting || !email.trim() || !password}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (isSubmitting || !email.trim() || !password) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign in</Text>
                  )}
                </Pressable>

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable disabled={isSubmitting} style={styles.forgotPassLink}>
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
                  Cloud account is optional. You can store your memories privately on this device.
                </Text>
                <Pressable
                  onPress={continueLocally}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Continue without account</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    themeToggle: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    themeToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      gap: 20,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      alignSelf: 'center',
      marginBottom: 6,
    },
    brandMark: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 8px 24px ${isDark ? 'rgba(128, 82, 200, 0.4)' : 'rgba(128, 101, 143, 0.3)'}`,
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }),
    },
    brandName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 2,
    },
    brandTagline: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    headerBlock: {
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 18,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.5)'
              : '0 12px 36px rgba(48, 36, 61, 0.08)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }),
    },
    fieldContainer: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 0.2,
      marginLeft: 4,
    },
    inputTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceOverlay,
      borderRadius: 999,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      minHeight: 50,
      gap: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    },
    inputError: {
      borderColor: colors.error,
    },
    showPasswordButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    showPasswordText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
    },
    fieldError: {
      fontSize: 12,
      color: colors.error,
      marginLeft: 12,
    },
    errorContainer: {
      backgroundColor: colors.errorSoft,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 16,
      padding: 12,
    },
    errorMessage: {
      fontSize: 13,
      color: colors.error,
      textAlign: 'center',
      lineHeight: 18,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    rememberMeBox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: colors.borderSoft,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rememberMeBoxChecked: {
      backgroundColor: colors.accent,
    },
    rememberMeIconText: {
      color: colors.accent,
      fontSize: 18,
    },
    rememberMeText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 6px 20px ${isDark ? 'rgba(128, 82, 200, 0.4)' : 'rgba(128, 101, 143, 0.3)'}`,
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    forgotPassLink: {
      alignSelf: 'center',
      paddingVertical: 4,
    },
    link: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '600',
    },
    linkDisabled: {
      opacity: 0.5,
    },
    localAccess: {
      gap: 12,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    localMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    privacyNote: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
  });
}