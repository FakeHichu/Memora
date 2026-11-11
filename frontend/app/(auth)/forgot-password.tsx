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
import { resetPasswordForEmail } from '@/lib/supabase/auth';
import { useAppTheme } from '@/providers/ThemeProvider';
export default function ForgotPasswordScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
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
  const sendResetLink = async () => {
    setMessage(null);
    setSuccessMessage(null);
    if (!validateEmail(email)) return;
    setIsSending(true);
    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setMessage(error.message);
        setIsSending(false);
        return;
      }
      setSuccessMessage('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setIsSending(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
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
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>
          {/* Card */}
          <View style={styles.card}>
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
                  returnKeyType="done"
                  onSubmitEditing={sendResetLink}
                  editable={!isSending}
                  style={styles.input}
                />
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
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
            <Pressable
              onPress={sendResetLink}
              disabled={isSending || !email.trim()}
              style={({ pressed }) => [
                styles.primaryButton,
                (isSending || !email.trim()) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send reset instructions</Text>
              )}
            </Pressable>
          </View>
          {/* Back to login */}
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back to sign in</Text>
            </Pressable>
          </Link>
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
      gap: 20,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      alignSelf: 'center',
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
    backLink: {
      alignSelf: 'center',
      paddingVertical: 4,
    },
    backLinkText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
  });
}