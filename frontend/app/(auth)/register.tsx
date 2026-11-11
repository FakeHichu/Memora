import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { signUpWithEmail } from '@/lib/supabase/auth';
import { useAppTheme } from '@/providers/ThemeProvider';
export default function RegisterScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
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
  const validateName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return false;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError(null);
    return true;
  };
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
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])/.test(val)) {
      setPasswordError('Must contain at least one lowercase letter');
      return false;
    }
    if (!/(?=.*[A-Z])/.test(val)) {
      setPasswordError('Must contain at least one uppercase letter');
      return false;
    }
    if (!/(?=.*\d)/.test(val)) {
      setPasswordError('Must contain at least one number');
      return false;
    }
    setPasswordError(null);
    return true;
  };
  const validateConfirmPassword = (val: string): boolean => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (val !== password) {
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
        if (error.message.includes('User already registered')) {
          setMessage('This email is already registered. Please sign in instead.');
        } else {
          setMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }
      if (data?.session) {
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          router.replace('/(onboarding)/welcome');
        }, 1000);
      } else {
        setSuccessMessage('Account created! Please check your email to verify, then sign in.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Brand Row */}
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Image
                source={require('@/assets/brand/logo-cat.png')}
                style={styles.brandMarkImage}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.brandName}>MEMORA</Text>
              <Text style={styles.brandTagline}>Memory Capsule</Text>
            </View>
          </View>
          {/* Heading */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start preserving your moments and memories today.</Text>
          </View>
          {/* Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <View style={[styles.inputTrack, nameError && styles.inputError]}>
                <Icon name="user" size={18} color={colors.textSecondary} />
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
                  style={styles.input}
                />
              </View>
              {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
            </View>
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={[styles.inputTrack, emailError && styles.inputError]}>
                <Icon name="envelope" size={18} color={colors.textSecondary} />
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
                  style={styles.input}
                />
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>
            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Password (8+ chars, upper, lower, num)</Text>
              <View style={[styles.inputTrack, passwordError && styles.inputError]}>
                <Icon name="padlock" size={18} color={colors.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(null);
                    if (message) setMessage(null);
                  }}
                  onBlur={() => password && validatePassword(password)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
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
            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Confirm password</Text>
              <View style={[styles.inputTrack, confirmPasswordError && styles.inputError]}>
                <Icon name="padlock" size={18} color={colors.textSecondary} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError(null);
                    if (message) setMessage(null);
                  }}
                  onBlur={() => confirmPassword && validateConfirmPassword(confirmPassword)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showPasswordButton}
                  disabled={isSubmitting}
                >
                  <Text style={styles.showPasswordText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.fieldError}>{confirmPasswordError}</Text>
              ) : null}
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
            {/* Submit Button */}
            <Pressable
              onPress={handleRegister}
              disabled={isSubmitting || !name || !email || !password || !confirmPassword}
              style={({ pressed }) => [
                styles.primaryButton,
                (isSubmitting || !name || !email || !password || !confirmPassword) &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </Pressable>
          </View>
          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isSubmitting}>
                <Text style={[styles.loginLink, isSubmitting && styles.linkDisabled]}>
                  Sign in
                </Text>
              </Pressable>
            </Link>
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      gap: 18,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      alignSelf: 'center',
      marginBottom: 4,
    },
    brandMark: {
      width: 50,
      height: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0E0D17',
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(128, 82, 200, 0.4)',
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
    brandMarkImage: {
      width: 50,
      height: 50,
      borderRadius: 18,
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
      gap: 16,
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
      gap: 6,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
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
      minHeight: 48,
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
    successContainer: {
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.success,
      borderRadius: 16,
      padding: 12,
    },
    successMessage: {
      fontSize: 13,
      color: colors.success,
      textAlign: 'center',
      lineHeight: 18,
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
    linkDisabled: {
      opacity: 0.5,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
  });
}